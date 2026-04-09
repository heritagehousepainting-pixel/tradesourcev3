import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/users/[id] — fetch a single contractor application by ID.
// Restricted to authenticated admin (Application Portal reviewers) only.
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ──────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// PUT /api/users/[id] — update a contractor application.
// Used for approve / reject / status transitions by founder/admin only.
// Requires canViewApplicationPortal (founder or Application Portal reviewer).
//
// Fields that can be updated through this endpoint:
//   - status         (required for approve/reject)
//   - verified_license   (set when license has been manually verified)
//   - verified_insurance  (set when insurance has been manually verified)
//   - verified_w9        (set when W-9 has been manually verified)
//
// Fields intentionally NOT supported here (require future migration):
//   - notes           — add as TEXT column if admin notes are needed
//   - reviewed_at     — add as TIMESTAMPTZ column if auto-timestamps are needed
//
// The admin page should send only the fields that are in allowedFields.
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const body = await request.json()

    // Validate status transition values if provided
    const allowedStatuses = ['pending_review', 'pending', 'approved', 'rejected']
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Only allow fields that exist in the DB schema.
    // Any field not in this list is silently ignored by the API.
    const allowedFields = [
      'status',
      'verified_license',
      'verified_insurance',
      'verified_w9',
    ]
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('contractor_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

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

    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const allowedStatuses = ['pending_review', 'pending', 'approved', 'rejected', 'suspended', 'removed']
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const allowedFields = [
      'status',
      'verified_license',
      'verified_insurance',
      'verified_w9',
      'notes',
      'reviewed_at',
    ]
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Auto-set reviewed_at when status transitions to a decision state
    if (
      updateData.status &&
      updateData.status !== 'pending_review' &&
      updateData.status !== 'pending'
    ) {
      updateData.reviewed_at = new Date().toISOString()
    }

    const supabase = await getSupabaseAdminClient()

    // ── On approval: send invite email to contractor ─────────────────────────
    // Auth account is created when the contractor clicks the invite link and
    // sets their own password. This ensures no account exists before approval.
    if (updateData.status === 'approved') {
      const { data: existing } = await supabase
        .from('contractor_applications')
        .select('email, auth_user_id')
        .eq('id', id)
        .single()

      if (!existing?.email) {
        return NextResponse.json({ error: 'No email on application — cannot send invite' }, { status: 400 })
      }

      // Only send invite if no auth_user_id already exists (avoid duplicate invites)
      if (!existing.auth_user_id) {
        const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(existing.email)
        if (inviteErr) {
          console.error('Failed to send invite on approval:', inviteErr.message)
          // Non-fatal: approval still succeeds; admin can manually resend invite
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

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

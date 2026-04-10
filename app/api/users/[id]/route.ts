import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { hash as bcryptHash } from 'bcryptjs'
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

    // ── When approving, create a Supabase Auth user account for the contractor ──
    // The service-role client bypasses RLS for this admin-only operation.
    const supabase = await getSupabaseAdminClient()
    let authUserId: string | null = null

    if (updateData.status === 'approved') {
      const { data: existing, error: fetchErr } = await supabase
        .from('contractor_applications')
        .select('id, email, auth_user_id, full_name, name, company, raw_password')
        .eq('id', id)
        .single()

      if (!fetchErr && existing && !existing.auth_user_id && existing.email) {
        const rawPw =
          typeof existing.raw_password === 'string' && existing.raw_password.length >= 8
            ? existing.raw_password
            : 'Welcome2025!'

        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: existing.email,
          email_confirm: true,
          password: rawPw,
          user_metadata: {
            full_name: existing.full_name || existing.name || existing.company || '',
          },
        })

        if (!authErr && authUser?.user) {
          authUserId = authUser.user.id
          updateData.auth_user_id = authUserId
        } else if (authErr) {
          console.error('Failed to create auth user on approval:', authErr.message)
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

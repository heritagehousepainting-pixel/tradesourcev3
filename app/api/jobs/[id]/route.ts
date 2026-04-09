import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/jobs/[id] — fetch a single job by ID (public read, no auth required)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/jobs/[id] — update a job's status and/or assigned contractor.
// Access: job poster OR founder/admin.
// Never trusts body.poster_id — always resolves ownership server-side from DB.
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: jobId } = await params
    const body = await request.json()

    // ── Server-side auth check ─────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    // Fetch the job from the DB to verify ownership server-side.
    // Do NOT trust body.poster_id — it comes from the client and could be forged.
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, poster_id, contractor_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Founder/admin bypasses ownership check — product override.
    // Non-founders: must be the job poster.
    const isOwner = access.userId && job.poster_id && job.poster_id === access.userId
    if (!access.isFounderEmail && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden — you did not post this job' },
        { status: 403 }
      )
    }

    // Validate status transitions if a new status is provided.
    // Jobs follow a strict lifecycle: open → awarded → in_progress → completed
    if (body.status) {
      const validTransitions: Record<string, string[]> = {
        open: ['awarded', 'cancelled'],
        awarded: ['in_progress', 'cancelled'],
        in_progress: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
      }
      const allowed = validTransitions[job.status] || []
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from '${job.status}' to '${body.status}'. Valid transitions: ${allowed.join(', ') || 'none'}` },
          { status: 400 }
        )
      }
    }

    // Build update payload from validated, allowed fields only.
    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = body.status
    if (body.contractor_id !== undefined) updateData.contractor_id = body.contractor_id

    // If nothing valid to update, return early.
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

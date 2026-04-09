import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import type { NextRequest } from 'next/server'

// POST /api/jobs/[id]/award — award a job to a contractor
// Requires: authenticated user (poster or founder/admin)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const body = await request.json()
    const { contractor_id } = body

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    if (!contractor_id) {
      return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 })
    }

    const { getSupabaseAdminClient } = await import('@/lib/supabase/server')
    const supabase = await getSupabaseAdminClient()

    // Verify the job exists and is open
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, contractor_id, poster_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'open') {
      return NextResponse.json({ error: `Job is already ${job.status}` }, { status: 400 })
    }

    // Non-founders must be the job poster to award
    if (!access.isFounderEmail && job.poster_id && job.poster_id !== access.userId) {
      return NextResponse.json({ error: 'Forbidden — you did not post this job' }, { status: 403 })
    }

    // Mark this interest as awarded
    await supabase
      .from('job_interests')
      .update({ awarded: true })
      .eq('job_id', jobId)
      .eq('contractor_id', contractor_id)

    // Clear awarded flag on other interests
    await supabase
      .from('job_interests')
      .update({ awarded: false })
      .neq('contractor_id', contractor_id)

    // Update job status to awarded and set contractor
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({ status: 'awarded', contractor_id })
      .eq('id', jobId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Get the awarded contractor's info for notification
    const { data: contractor } = await supabase
      .from('contractor_applications')
      .select('name, email')
      .eq('id', contractor_id)
      .single()

    return NextResponse.json({
      job: updatedJob,
      awarded_to: contractor,
      message: 'Job awarded successfully',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

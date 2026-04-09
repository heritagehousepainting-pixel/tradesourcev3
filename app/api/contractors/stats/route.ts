import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/contractors/stats?contractor_id=xxx
// Returns per-contractor job stats (jobs won, interests expressed, milestone).
// Access: the contractor themselves, or founder/admin.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')

    if (!contractorId) {
      return NextResponse.json({ error: 'contractor_id required' }, { status: 400 })
    }

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.isFounderEmail && access.userId && access.userId !== contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    const { data: contractorJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('contractor_id', contractorId)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const jobsThisMonth = (contractorJobs || []).filter((j: any) =>
      j.status === 'completed' && j.updated_at && new Date(j.updated_at) >= new Date(monthStart)
    ).length

    const jobsWon = (contractorJobs || []).filter((j: any) =>
      j.status === 'completed' || j.status === 'in_progress'
    ).length

    const { data: interests } = await supabase
      .from('job_interests')
      .select('*')
      .eq('contractor_id', contractorId)

    const totalInterests = (interests || []).length

    let milestone: string | null = null
    let milestoneLabel = ''
    if (jobsWon >= 10) {
      milestone = 'legend'
      milestoneLabel = 'Legend — 10+ Jobs Won!'
    } else if (jobsWon >= 5) {
      milestone = 'pro'
      milestoneLabel = 'Pro — 5+ Jobs Won!'
    } else if (jobsWon >= 1) {
      milestone = 'starter'
      milestoneLabel = 'First Job Won!'
    }

    return NextResponse.json({ jobsThisMonth, jobsWon, totalInterests, milestone, milestoneLabel })
  } catch (error: any) {
    return NextResponse.json(
      { jobsThisMonth: 0, jobsWon: 0, totalInterests: 0, milestone: null, milestoneLabel: '' },
      { status: 200 }
    )
  }
}

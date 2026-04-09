import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: users } = await supabase
      .from('contractor_applications')
      .select('*')

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')

    const approved = users?.filter(u => u.status === 'approved').length || 0
    const completed = jobs?.filter(j => j.status === 'completed').length || 0
    const open = jobs?.filter(j => j.status === 'open').length || 0
    const inProgress = jobs?.filter(j => j.status === 'in_progress').length || 0

    // Weekly Digest: last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const jobsThisWeek = (jobs || []).filter(j => {
      const created = j.created_at ? new Date(j.created_at) : new Date(j.createdAt || 0)
      return created >= oneWeekAgo
    }).length

    const newContractorsThisWeek = (users || []).filter(u => {
      if (u.status !== 'approved') return false
      const created = new Date(u.created_at || u.createdAt || 0)
      return created >= oneWeekAgo
    }).length

    const completedThisWeek = (jobs || []).filter(j => {
      if (j.status !== 'completed') return false
      const updated = new Date(j.updated_at || j.updatedAt || 0)
      return updated >= oneWeekAgo
    }).length

    // Top states by open jobs
    const stateJobCounts: Record<string, number> = {}
    ;(jobs || []).filter(j => j.status === 'open').forEach(j => {
      const area = j.area || j.location || ''
      const parts = area.split(',')
      const state = parts[parts.length - 1]?.trim().split(' ')[0] || 'US'
      stateJobCounts[state] = (stateJobCounts[state] || 0) + 1
    })
    const topStates = Object.entries(stateJobCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }))

    // Recent reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const recentReviews = (reviews || []).map(r => ({
      contractorName: r.contractor_name || 'A contractor',
      homeownerName: r.homeowner_name || 'A homeowner',
      rating: r.rating,
    }))

    return NextResponse.json({
      totalPainters: approved,
      activeToday: open,
      workingNow: inProgress,
      jobsCompleted: completed,
      digest: {
        jobsThisWeek,
        newContractorsThisWeek,
        completedThisWeek,
        topStates,
        recentReviews,
      }
    })
  } catch (error) {
    return NextResponse.json({ totalPainters: 0, activeToday: 0, workingNow: 0, jobsCompleted: 0, digest: null })
  }
}

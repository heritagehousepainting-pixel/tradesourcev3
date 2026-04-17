import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

// GET /api/admin/contractors/[id]
// Returns contractor profile + posted jobs + expressed interests
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const access = await getServerUserAccess(request as any)
    if (!access.canViewApplicationPortal) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = await getSupabaseAdminClient()
    const contractorId = params.id
    const { data: contractor, error: contractorErr } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', contractorId)
      .single()

    if (contractorErr || !contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // 2. Get jobs posted by this contractor
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, status, trade_type, service_area, price_range, created_at, job_photos(id, url)')
      .eq('poster_id', contractor.auth_user_id || contractorId)
      .order('created_at', { ascending: false })
      .limit(20)

    // 3. Get expressed interests (if interests table exists)
    let interests: any[] = []
    const { data: interestsData } = await supabase
      .from('job_interests')
      .select('id, job_id, created_at, jobs(title, status)')
      .eq('contractor_id', contractor.auth_user_id || contractorId)
      .order('created_at', { ascending: false })
      .limit(20)
    interests = interestsData || []

    return NextResponse.json({
      contractor,
      jobs: jobs || [],
      interests: interests.filter(i => i?.jobs), // only valid interests with job data
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
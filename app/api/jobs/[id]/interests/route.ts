import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/jobs/[id]/interests — fetch all contractors who expressed interest in a job.
// Uses admin client for consistent RLS bypass (job data is network-visible).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const supabase = await getSupabaseAdminClient()

    const { data: interests, error } = await supabase
      .from('job_interests')
      .select(`
        *,
        contractors:contractor_id (
          id,
          full_name,
          name,
          company,
          email,
          phone,
          license_number,
          license_state,
          verified_license,
          verified_insurance,
          verified_w9,
          verified_external,
          is_pro,
          status,
          created_at,
          years_in_trade
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(interests || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

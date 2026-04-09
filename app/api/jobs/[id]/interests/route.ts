import { NextResponse } from 'next/server'

// GET /api/jobs/[id]/interests — fetch all contractors who expressed interest in a job
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch all interests for this job, joined with contractor details
    // Note: full_name, business_name, license_state, years_in_trade, insurance_expiry
    // are added by migration 003. Until then, use name/company from base schema.
    const { data: interests, error } = await supabase
      .from('job_interests')
      .select(`
        *,
        contractors:contractor_id (
          id,
          name,
          company,
          email,
          phone,
          license_number,
          verified_license,
          verified_insurance,
          verified_w9,
          verified_external,
          is_pro,
          rating,
          review_count,
          status,
          created_at
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

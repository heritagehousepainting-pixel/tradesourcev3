import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getServerUserAccess } from '@/lib/auth/access.server'

// GET /api/reviews — public read (contractor_id / reviewer_id / job_id filters via params)
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')
    const reviewerId = searchParams.get('reviewer_id')
    const jobId = searchParams.get('job_id')

    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (contractorId) query = query.eq('contractor_id', contractorId)
    if (reviewerId) query = query.eq('reviewer_id', reviewerId)
    if (jobId) query = query.eq('job_id', jobId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Compute average rating per contractor
    const ratings: Record<string, { sum: number; count: number }> = {}
    for (const r of data || []) {
      if (!r.contractor_id) continue
      if (!ratings[r.contractor_id]) ratings[r.contractor_id] = { sum: 0, count: 0 }
      ratings[r.contractor_id].sum += r.rating
      ratings[r.contractor_id].count++
    }
    const averages: Record<string, number> = {}
    for (const [cid, val] of Object.entries(ratings)) {
      averages[cid] = Math.round((val.sum / val.count) * 10) / 10
    }

    return NextResponse.json({ reviews: data, averages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/reviews — authenticated submit a review
export async function POST(request: Request) {
  try {
    const { getServerUserAccess } = await import('@/lib/auth/access.server')
    const access = await getServerUserAccess(request as any)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { contractor_id, homeowner_name, job_id, rating, comment, reviewer_id, reviewer_type } = body

    if (!rating) {
      return NextResponse.json({ error: 'rating is required' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const insertBody = {
      rating,
      comment: comment || null,
      job_id: job_id || null,
      contractor_id: contractor_id || null,
      homeowner_name: homeowner_name || null,
      reviewer_id: reviewer_id || null,
      reviewer_type: reviewer_type || null,
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([insertBody])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

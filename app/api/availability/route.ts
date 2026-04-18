import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'

// GET /api/availability — public-ish read.
// Unauthenticated callers get a sanitized preview (no email, no direct contact data).
// Authenticated members see full contractor metadata needed for outreach context.
export async function GET(request: Request) {
  try {
    const access = await getServerUserAccess(request as unknown as NextRequest)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { searchParams } = new URL(request.url)
    const tradeType = searchParams.get('trade_type')

    let query = supabase
      .from('availability_posts')
      .select('*, contractors:contractor_id(full_name, company, email)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20)

    if (tradeType && tradeType !== 'all') {
      query = query.ilike('trade_type', `%${tradeType}%`)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('does not exist')) {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Strip contact PII (email) from unauthenticated responses.
    const rows = (data || []).map((row: any) => {
      if (access.isAuthenticated) return row
      const c = row.contractors || null
      return {
        ...row,
        contractors: c ? { full_name: c.full_name, company: c.company } : null,
      }
    })

    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/availability — authenticated contractors only.
// Must be an approved contractor and may only post availability for their own profile.
export async function POST(request: Request) {
  try {
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canAccessContractorApp) {
      return NextResponse.json({ error: 'Approved contractors only' }, { status: 403 })
    }

    const body = await request.json()

    // Force contractor_id to the authenticated user's profile — prevents impersonation.
    const contractorId = access.profile?.id
    if (!contractorId) {
      return NextResponse.json({ error: 'No contractor profile on file' }, { status: 403 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: post, error } = await supabase
      .from('availability_posts')
      .insert([{
        contractor_id: contractorId,
        trade_type: body.trade_type || 'painting',
        start_date: body.start_date,
        end_date: body.end_date,
        description: body.description,
        status: 'active',
      }])
      .select('*, contractors:contractor_id(full_name, company, email)')
      .single()

    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Availability posts table not available yet' }, { status: 503 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
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
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: post, error } = await supabase
      .from('availability_posts')
      .insert([{
        contractor_id: body.contractor_id,
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

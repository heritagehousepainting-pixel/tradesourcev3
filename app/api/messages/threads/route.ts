import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getServerUserAccess } from '@/lib/auth/access.server'

// GET /api/messages/threads — public browse (contractor_id / job_id filters via params)
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')
    const jobId = searchParams.get('job_id')

    let query = supabase
      .from('message_threads')
      .select('*, jobs(title, area, status)')
      .order('updated_at', { ascending: false })

    if (contractorId) query = query.eq('contractor_id', contractorId)
    if (jobId) query = query.eq('job_id', jobId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Attach latest message preview
    const threads = data || []
    const withPreviews = await Promise.all(
      threads.map(async (thread: any) => {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        return { ...thread, last_message: lastMsg?.content || null, last_message_at: lastMsg?.created_at || null }
      })
    )

    return NextResponse.json(withPreviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/messages/threads — authenticated create/open a thread
export async function POST(request: Request) {
  try {
    const { getServerUserAccess } = await import('@/lib/auth/access.server')
    const access = await getServerUserAccess(request as any)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, homeowner_email, contractor_id } = body

    if (!job_id || !homeowner_email || !contractor_id) {
      return NextResponse.json({ error: 'job_id, homeowner_email, and contractor_id are required' }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: existing } = await supabase
      .from('message_threads')
      .select('*')
      .eq('job_id', job_id)
      .eq('contractor_id', contractor_id)
      .single()

    if (existing) return NextResponse.json(existing)

    const { data, error } = await supabase
      .from('message_threads')
      .insert([{ job_id, homeowner_email, contractor_id }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

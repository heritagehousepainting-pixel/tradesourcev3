import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import type { NextRequest } from 'next/server'

// GET /api/messages/threads — list threads for the authenticated user
export async function GET(request: Request) {
  try {
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = await getSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')
    const jobId = searchParams.get('job_id')

    // Non-founders can only see threads they are a participant in
    let query = supabase
      .from('message_threads')
      .select('*, jobs(title, area, status, poster_id)')
      .order('updated_at', { ascending: false })

    if (!access.isFounderEmail && access.userId) {
      // Filter to threads where the user is either the contractor or the job poster
      query = query.or(`contractor_id.eq.${access.userId},jobs.poster_id.eq.${access.userId}`)
    }

    if (contractorId) query = query.eq('contractor_id', contractorId)
    if (jobId) query = query.eq('job_id', jobId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Attach latest message preview
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

    // Verify the authenticated user is either the job poster or the awarded contractor
    const { data: job } = await supabase
      .from('jobs')
      .select('poster_id, contractor_id')
      .eq('id', job_id)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const isAuthorized = access.userId === job.poster_id || access.userId === contractor_id
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: you are not authorized to create this thread' }, { status: 403 })
    }

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

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import type { NextRequest } from 'next/server'

// GET /api/messages/threads?contractor_id=xxx
// List threads for the authenticated user.
// Non-founders see only threads where they are the contractor.
// Founders/admins see all threads, optionally filtered by contractor_id.
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

    let query = supabase
      .from('message_threads')
      .select('*, jobs(title, area, status, poster_id, contractor_id)')
      .order('updated_at', { ascending: false })

    if (!access.isFounderEmail && access.userId) {
      // Non-founders see threads where they are either:
      // (a) the awarded contractor: contractor_id = their profile ID
      // (b) the job poster: jobs.poster_id = their profile ID (via join)
      const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
      if (profileId) {
        // Fetch contractor threads (contractor_id = profileId)
        const { data: contractorThreads } = await supabase
          .from('message_threads')
          .select('*, jobs(title, area, status, poster_id, contractor_id)')
          .eq('contractor_id', profileId)
          .order('updated_at', { ascending: false })

        // Fetch poster threads (jobs.poster_id = profileId)
        const { data: posterThreads } = await supabase
          .from('message_threads')
          .select('*, jobs(title, area, status, poster_id, contractor_id)')
          .eq('jobs.poster_id', profileId)
          .order('updated_at', { ascending: false })

        // Deduplicate by thread id and merge
        const seen = new Set<string>()
        const merged: any[] = []
        for (const t of [...(contractorThreads || []), ...(posterThreads || [])]) {
          if (!seen.has(t.id)) { seen.add(t.id); merged.push(t) }
        }
        // Sort by updated_at
        merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

        // Attach last message preview
        const withPreviews = await Promise.all(merged.map(async (thread: any) => {
          try {
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('thread_id', thread.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            return { ...thread, last_message: lastMsg?.content || null, last_message_at: lastMsg?.created_at || null }
          } catch { return { ...thread, last_message: null, last_message_at: null } }
        }))
        return NextResponse.json(withPreviews)
      }
    }

    if (contractorId) query = query.eq('contractor_id', contractorId)
    if (jobId) query = query.eq('job_id', jobId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const threads = data || []
    const withPreviews = await Promise.all(
      threads.map(async (thread: any) => {
        try {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          return { ...thread, last_message: lastMsg?.content || null, last_message_at: lastMsg?.created_at || null }
        } catch { return { ...thread, last_message: null, last_message_at: null } }
      })
    )

    return NextResponse.json(withPreviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/messages/threads — create/open a thread.
// Requires: authenticated user who is the job poster or awarded contractor.
// Idempotent: returns existing thread if one already exists for this job+contractor.
export async function POST(request: Request) {
  try {
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, homeowner_email, contractor_id } = body

    if (!job_id || !homeowner_email || !contractor_id) {
      return NextResponse.json(
        { error: 'job_id, homeowner_email, and contractor_id are required' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseAdminClient()

    const { data: job } = await supabase
      .from('jobs')
      .select('poster_id, contractor_id')
      .eq('id', job_id)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const isAuthorized =
      access.userId === job.poster_id || access.userId === contractor_id
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: you are not authorized to create this thread' },
        { status: 403 }
      )
    }

    const { data: existing } = await supabase
      .from('message_threads')
      .select('id')
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

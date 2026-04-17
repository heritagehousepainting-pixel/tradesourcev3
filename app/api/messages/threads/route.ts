import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import type { NextRequest } from 'next/server'

// GET /api/messages/threads?contractor_id=xxx
// List threads for the authenticated user.
// Returns: thread + jobs + last_message preview + unread_count (messages from homeowner after last_viewed_at).
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
    const markViewed = searchParams.get('mark_viewed')

    // ── Build base thread query ────────────────────────────────────────────
    const baseSelect = '*, jobs(title, area, status, poster_id, contractor_id)'

    // Helper: attach last_message preview + unread_count to a thread
    async function enrichThread(thread: any) {
      const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null

      // Last message preview
      let last_message = null
      let last_message_at = null
      try {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        last_message = lastMsg?.content || null
        last_message_at = lastMsg?.created_at || null
      } catch { /* no messages yet */ }

      // Unread count: messages from homeowner (not the contractor's own email) created after last_viewed_at
      let unread_count = 0
      if (profileId) {
        try {
          const { data: homeownerMsgs } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .neq('sender_email', access.email ?? '')
          // Count messages created after last_viewed_at
          const viewed = thread.last_viewed_at
          if (homeownerMsgs && viewed) {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('thread_id', thread.id)
              .neq('sender_email', access.email ?? '')
              .gt('created_at', viewed)
            unread_count = count ?? 0
          } else if (homeownerMsgs && !viewed) {
            // Never viewed — all homeowner messages are unread
            unread_count = homeownerMsgs?.length ?? 0
          }
        } catch { /* fallback: 0 */ }
      }

      return {
        ...thread,
        last_message,
        last_message_at,
        unread_count,
      }
    }

    // ── Fetch threads ─────────────────────────────────────────────────────
    if (!access.isFounderEmail && access.userId) {
      const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
      if (profileId) {
        const { data: contractorThreads } = await supabase
          .from('message_threads')
          .select(baseSelect)
          .eq('contractor_id', profileId)
          .order('updated_at', { ascending: false })

        const { data: posterThreads } = await supabase
          .from('message_threads')
          .select(baseSelect)
          .eq('jobs.poster_id', profileId)
          .order('updated_at', { ascending: false })

        const seen = new Set<string>()
        const merged: any[] = []
        for (const t of [...(contractorThreads || []), ...(posterThreads || [])]) {
          if (!seen.has(t.id)) { seen.add(t.id); merged.push(t) }
        }
        merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

        // ── Mark as viewed (before enrich so unread counts are accurate) ───
        // Gracefully handles missing last_viewed_at column (migration 018).
        if (markViewed) {
          const now = new Date().toISOString()
          try {
            await supabase
              .from('message_threads')
              .update({ last_viewed_at: now })
              .eq('id', markViewed)
          } catch { /* column may not exist yet */ }
          const idx = merged.findIndex((t: any) => t.id === markViewed)
          if (idx !== -1) merged[idx].last_viewed_at = now
        }

        const enriched = await Promise.all(merged.map(enrichThread))
        return NextResponse.json(enriched)
      }
    }

    let query = supabase
      .from('message_threads')
      .select(baseSelect)
      .order('updated_at', { ascending: false })

    if (contractorId) query = query.eq('contractor_id', contractorId)
    if (jobId) query = query.eq('job_id', jobId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // ── Mark as viewed (before enrich so unread counts are accurate) ────────
    if (markViewed) {
      const now = new Date().toISOString()
      try {
        await supabase
          .from('message_threads')
          .update({ last_viewed_at: now })
          .eq('id', markViewed)
      } catch { /* column may not exist yet */ }
      const idx = (data || []).findIndex((t: any) => t.id === markViewed)
      if (idx !== -1) (data || [])[idx].last_viewed_at = now
    }

    const enriched = await Promise.all((data || []).map(enrichThread))
    return NextResponse.json(enriched)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/messages/threads — create/open a thread.
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
      return NextResponse.json({ error: 'job_id, homeowner_email, and contractor_id are required' }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()
    const { data: job } = await supabase
      .from('jobs')
      .select('poster_id, contractor_id')
      .eq('id', job_id)
      .single()

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const isAuthorized = access.userId === job.poster_id || access.userId === contractor_id
    if (!isAuthorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

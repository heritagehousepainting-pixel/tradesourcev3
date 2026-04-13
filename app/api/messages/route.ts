import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/messages?thread_id=xxx — fetch messages within a thread.
// Requires: authenticated user who is a participant in the thread.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('thread_id')

    if (!threadId) return NextResponse.json({ error: 'thread_id is required' }, { status: 400 })

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    // Verify the authenticated user is a participant in this thread.
    // Founders/admins bypass this check.
    // contractor_id and poster_id in the DB are contractor_applications.id values,
    // not Supabase auth UIDs — use contractorProfileId for correct matching.
    if (!access.isFounderEmail && access.userId) {
      const { data: thread } = await supabase
        .from('message_threads')
        .select('contractor_id, jobs(poster_id)')
        .eq('id', threadId)
        .single()

      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }

      const jobPosterId = (thread as any).jobs?.poster_id
      const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
      const isParticipant = profileId && (
        String(thread.contractor_id) === String(profileId) ||
        (jobPosterId && String(jobPosterId) === String(profileId))
      )
      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/messages — send a message to a thread.
// Requires: authenticated user.
export async function POST(request: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const body = await request.json()
    const { thread_id, sender_email, sender_name, content } = body

    if (!thread_id || !sender_email || !content) {
      return NextResponse.json(
        { error: 'thread_id, sender_email, and content are required' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseAdminClient()

    // Verify sender is a thread participant (contractor or job poster)
    // contractor_id and poster_id are contractor_applications.id values, not auth UIDs.
    if (!access.isFounderEmail && access.userId) {
      const { data: thread } = await supabase
        .from('message_threads')
        .select('contractor_id, jobs(poster_id)')
        .eq('id', thread_id)
        .single()

      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }

      const jobPosterId = (thread as any).jobs?.poster_id
      const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
      const isParticipant = profileId && (
        String(thread.contractor_id) === String(profileId) ||
        (jobPosterId && String(jobPosterId) === String(profileId))
      )
      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        thread_id,
        sender_email,
        sender_name: sender_name || null,
        content,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase
      .from('message_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', thread_id)

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

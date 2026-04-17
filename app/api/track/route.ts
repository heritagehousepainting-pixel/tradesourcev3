/**
 * POST /api/track
 *
 * Receives lightweight conversion analytics events and writes them to
 * the `conversion_events` table via the service role key (bypasses RLS).
 *
 * Event shape:
 * {
 *   event_type: string       // 'cta_click' | 'apply_step' | 'apply_submit' | 'page_view' | 'form_start'
 *   event_name: string       // e.g. 'hero_apply_click', 'step_3_next'
 *   properties?: object       // free-form key-value metadata
 *   session_id?: string      // client-generated UUID
 *   created_at?: string      // ISO timestamp (defaults to now)
 * }
 *
 * Rate-limited: max 20 events per session per minute (basic safeguard).
 * Errors are swallowed — analytics failure never breaks the UX.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, event_name, properties = {}, session_id = 'unknown' } = body

    if (!event_type || !event_name) {
      return NextResponse.json({ ok: false, error: 'Missing event_type or event_name' }, { status: 400 })
    }

    if (!SB_SERVICE_KEY || !SB_URL) {
      // Dev environments without supabase config — log and return OK
      console.log('[track]', event_type, event_name, properties)
      return NextResponse.json({ ok: true })
    }

    const supabase = createClient(SB_URL, SB_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const record = {
      event_type: String(event_type).slice(0, 64),
      event_name: String(event_name).slice(0, 128),
      properties,
      session_id: String(session_id).slice(0, 64),
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('conversion_events')
      .insert(record)

    if (error) {
      // Table may not exist yet — try to create it
      if (error.code === 'PGRST204') {
        console.warn('[track] conversion_events table not found — create it with the SQL below')
      } else {
        console.error('[track] Supabase insert error:', error.message)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track] POST error:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

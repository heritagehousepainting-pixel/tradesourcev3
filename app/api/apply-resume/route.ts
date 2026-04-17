/**
 * GET /api/apply-resume?token=...
 *
 * Looks up a resume token and returns saved form data if valid and not expired.
 * Tokens expire after 48 hours.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 })
  }

  if (!SB_SERVICE_KEY || !SB_URL) {
    // Dev without Supabase — return not found
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = createClient(SB_URL, SB_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await supabase
      .from('apply_resume_tokens')
      .select('form_data, step, email, expires_at')
      .eq('token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ ok: false, error: 'Token not found or expired' }, { status: 404 })
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: 'Token expired' }, { status: 410 })
    }

    // Optionally mark as used (one-time use)
    await supabase
      .from('apply_resume_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    return NextResponse.json({
      ok: true,
      form_data: data.form_data,
      step: data.step,
      email: data.email,
    })
  } catch (err) {
    console.error('[apply-resume] error:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

/**
 * POST /api/apply-save
 *
 * Saves partial apply form progress and generates a resume token.
 * Sends a resume link to the provided email.
 *
 * Body: { email: string, formData: object, step: number }
 * Creates a token in apply_resume_tokens. If a token already exists for this email,
 * it overwrites it (one active save per email).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export async function POST(req: NextRequest) {
  try {
    const { email, formData, step } = await req.json()

    if (!email || !formData) {
      return NextResponse.json({ ok: false, error: 'Missing email or form data' }, { status: 400 })
    }

    // Generate a short, URL-safe token
    const token = crypto.randomUUID()

    // Delete any existing tokens for this email (one active save per email)
    if (SB_SERVICE_KEY && SB_URL) {
      const supabase = createClient(SB_URL, SB_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      await supabase.from('apply_resume_tokens').delete().eq('email', email.toLowerCase().trim())

      const { error } = await supabase.from('apply_resume_tokens').insert({
        token,
        email: email.toLowerCase().trim(),
        form_data: formData,
        step: Number(step) || 1,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      })

      if (error) {
        console.error('[apply-save] insert error:', error.message)
        return NextResponse.json({ ok: false, error: 'Failed to save progress' }, { status: 500 })
      }
    }

    // Build resume URL — the apply page reads ?resume=token from the URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://project-bdhbf.vercel.app'
    const resumeUrl = `${baseUrl}/apply?resume=${token}`

    // Send resume email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL ?? 'info@tradesource.app',
            to: [email],
            subject: 'Your TradeSource application is saved — resume anytime',
            html: `
              <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 32px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 32px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: #2563EB; display: flex; align-items: center; justify-content: center;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <strong style="font-size: 16px; color: #111;">TradeSource</strong>
                </div>
                <h1 style="font-size: 24px; font-weight: 800; color: #111; margin: 0 0 16px; letter-spacing: -0.03em;">Your application progress is saved.</h1>
                <p style="font-size: 15px; color: #555; line-height: 1.65; margin: 0 0 24px;">
                  Your TradeSource application progress has been saved. Continue where you left off — click the button below.
                </p>
                <a href="${resumeUrl}"
                   style="display: inline-block; padding: 14px 28px; background: #2563EB; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(37,99,235,0.3); margin-bottom: 24px;">
                  Resume My Application
                </a>
                <p style="font-size: 12px; color: #999; line-height: 1.6;">
                  This link expires in 48 hours. If you didn't save your progress, you can ignore this email.<br/>
                  If the button doesn't work, copy and paste this URL into your browser:<br/>
                  <a href="${resumeUrl}" style="color: #2563EB; word-break: break-all;">${resumeUrl}</a>
                </p>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        console.warn('[apply-save] email send failed:', emailError)
        // Non-fatal — the save still succeeded
      }
    }

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    console.error('[apply-save] error:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

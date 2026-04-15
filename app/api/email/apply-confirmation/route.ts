import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.FROM_EMAIL || 'TradeSource <onboarding@tradesource.app>'

/**
 * POST — send a contractor application confirmation email.
 *
 * Body:
 *   name        string  — contractor's full name
 *   email       string  — contractor's email address
 */
export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your TradeSource application is in review',
      html: buildEmail(name),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[email/apply-confirmation] Error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

function buildEmail(name: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">

          <!-- Header -->
          <tr>
            <td style="background:#1E40AF;padding:32px 32px 28px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">
                TradeSource
              </div>
              <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:0.03em;">
                Trusted Contractor Network
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="font-size:26px;font-weight:800;color:#111827;letter-spacing:-0.03em;margin:0 0 8px;">
                Application received, ${name.split(' ')[0]} 👋
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
                We've received your TradeSource application and will review it personally.
              </p>

              <!-- Timeline -->
              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
                ${[
                  { n: '1', title: 'Personal review', desc: 'Our team reads every application personally — not just an automated check.' },
                  { n: '2', title: 'Email within 1–2 days', desc: "You'll hear our decision at <strong>${email}</strong>." },
                  { n: '3', title: 'Start finding work', desc: 'Approved contractors can browse open jobs, express interest, and post overflow work immediately.' },
                ].map((s, i) => `
                <tr>
                  <td style="padding:0 0 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:16px;">
                          <div style="width:32px;height:32px;border-radius:50%;background:#EFF6FF;border:1.5px solid #BFDBFE;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#1E40AF;">${s.n}</div>
                        </td>
                        <td>
                          <div style="font-size:14px;font-weight:700;color:#111827;margin:0 0 3px;">${s.title}</div>
                          <div style="font-size:13px;color:#6B7280;line-height:1.5;margin:0;">${s.desc}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join('')}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <a href="https://project-bdhbf.vercel.app/jobs" style="display:inline-block;padding:13px 32px;background:#1E40AF;border-radius:10px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:-0.01em;">
                      Browse Open Jobs →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="font-size:12px;color:#9CA3AF;line-height:1.6;margin:0;border-top:1px solid #F3F4F6;padding-top:20px;">
                Questions? Reply to this email or reach us at
                <a href="mailto:info@tradesource.app" style="color:#1E40AF;text-decoration:none;">info@tradesource.app</a>.
                TradeSource · Bucks County, PA · Trusted Contractor Network.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

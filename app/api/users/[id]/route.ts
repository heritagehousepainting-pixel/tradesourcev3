import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import type { NextRequest } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL || 'TradeSource <onboarding@tradesource.app>'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/users/[id] — fetch a single contractor application by ID.
// Restricted to authenticated admin (Application Portal reviewers) only.
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// PUT /api/users/[id] — update a contractor application.
// Used for approve / reject / status transitions by founder/admin only.
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const allowedStatuses = ['pending_review', 'pending', 'approved', 'rejected', 'suspended', 'removed']
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const allowedFields = [
      'status',
      'verified_license',
      'verified_insurance',
      'verified_w9',
      'notes',
      'reviewed_at',
      'auth_user_id',
    ]
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Auto-set reviewed_at when status transitions to a decision state
    if (
      updateData.status &&
      updateData.status !== 'pending_review' &&
      updateData.status !== 'pending'
    ) {
      updateData.reviewed_at = new Date().toISOString()
    }

    const supabase = await getSupabaseAdminClient()

    // ── On approval: send invite email to contractor ─────────────────────────
    // Auth account is created when the contractor clicks the invite link and
    // sets their own password. This ensures no account exists before approval.
    if (updateData.status === 'approved') {
      const { data: existing } = await supabase
        .from('contractor_applications')
        .select('email, auth_user_id')
        .eq('id', id)
        .single()

      if (!existing?.email) {
        return NextResponse.json({ error: 'No email on application — cannot send invite' }, { status: 400 })
      }

      // Only send invite if no auth_user_id already exists (avoid duplicate invites)
      if (!existing.auth_user_id) {
        const { data: inviteData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(existing.email)
        if (inviteErr) {
          console.error('Failed to send invite on approval:', inviteErr.message)
          // Non-fatal: approval still succeeds; admin can manually resend invite
        } else if (inviteData?.user?.id) {
          // Auth account created — link it to contractor_applications immediately
          updateData.auth_user_id = inviteData.user.id
        }
      }

      // Send approval welcome email (non-blocking — approval succeeds even if email fails)
      sendApprovalEmail(existing.email, updateData.auth_user_id ? 'setup' : 'pending').catch(err =>
        console.error('[email/approval] Failed to send:', err)
      )
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contractor_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// ── Email helpers (non-blocking — failures logged, not surfaced to caller) ──

async function sendApprovalEmail(email: string, mode: 'setup' | 'pending') {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject:
        mode === 'setup'
          ? "You're in — set up your TradeSource account"
          : "You're approved — welcome to TradeSource",
      html: buildApprovalEmail(mode),
    })
  } catch {
    // Non-fatal — caller handles the response, not email delivery
  }
}

function buildApprovalEmail(mode: 'setup' | 'pending') {
  const ctaLabel =
    mode === 'setup' ? 'Set Up Account →' : 'Browse Open Jobs →'
  const ctaUrl =
    mode === 'setup'
      ? 'https://project-bdhbf.vercel.app/login'
      : 'https://project-bdhbf.vercel.app/jobs'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
          <tr>
            <td style="background:#1E40AF;padding:32px 32px 28px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">TradeSource</div>
              <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:0.03em;">Trusted Contractor Network</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="font-size:26px;font-weight:800;color:#111827;letter-spacing:-0.03em;margin:0 0 8px;">
                You're approved! 🎉
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
                Welcome to TradeSource. You're now part of a curated network of trusted
                contractors in Bucks County and the surrounding areas.
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
                ${[
                  {
                    icon: '✓',
                    title: 'Browse open jobs',
                    desc: 'Find work that matches your trade and service area — homeowners post jobs every day.',
                  },
                  {
                    icon: '✓',
                    title: 'Express your interest',
                    desc: "When you see a job you want, tap Express Interest — the homeowner reviews all responses and awards the job.",
                  },
                  {
                    icon: '✓',
                    title: 'Post overflow work',
                    desc: "Have a job that's too big or too far? Post it on TradeSource and let other contractors bid.",
                  },
                ]
                  .map(
                    s => `
                <tr>
                  <td style="padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;">
                          <div style="width:28px;height:28px;border-radius:50%;background:#ECFDF5;border:1.5px solid #A7F3D0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#059669;">${s.icon}</div>
                        </td>
                        <td>
                          <div style="font-size:14px;font-weight:700;color:#111827;margin:0 0 2px;">${s.title}</div>
                          <div style="font-size:13px;color:#6B7280;line-height:1.5;margin:0;">${s.desc}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`,
                  )
                  .join('')}
              </table>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="center" style="padding-top:4px;">
                    <a href="${ctaUrl}" style="display:inline-block;padding:13px 32px;background:#1E40AF;border-radius:10px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:-0.01em;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="font-size:12px;color:#9CA3AF;line-height:1.6;margin:0;border-top:1px solid #F3F4F6;padding-top:20px;">
                Questions? Reply to this email or contact us at
                <a href="mailto:info@tradesource.app" style="color:#1E40AF;text-decoration:none;">info@tradesource.app</a>.
                TradeSource · Bucks County, PA.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

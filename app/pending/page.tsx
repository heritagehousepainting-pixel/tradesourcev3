/**
 * /pending — Application status and post-submission confirmation page.
 *
 * Server Component — renders the submission confirmation in the initial HTML
 * so it is visible before JS loads (SEO + social share). All interactive
 * states (checking auth, signed-in pending) are handled client-side.
 */
import { Metadata } from 'next'
import PendingPageClient from './PendingPageClient'

export const metadata: Metadata = {
  title: 'Application Status — TradeSource',
  description: 'Check your TradeSource contractor application status.',
}

type Props = { searchParams: Promise<{ submitted?: string }> }

export default async function PendingPage({ searchParams }: Props) {
  const { submitted } = await searchParams
  const isJustSubmitted = submitted === 'true'

  // When the user just submitted (not signed in yet), render the confirmation
  // on the server so it appears in the initial HTML with full text content.
  if (isJustSubmitted) {
    return <SubmittedConfirmationServer />
  }

  // All other states are interactive — client component takes over.
  return <PendingPageClient isJustSubmitted={false} />
}

// ─── Server-rendered confirmation (no JS required) ────────────────────────────

function PendingNavServer() {
  return (
    <header style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>TradeSource</span>
          </a>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="/jobs" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Browse Jobs</a>
            <a href="/apply" style={{ fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none' }}>
              Apply to Join
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

function SubmittedConfirmationServer() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PendingNavServer />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ backgroundColor: 'var(--color-bg-alt)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

            {/* Green accent bar */}
            <div style={{ height: 4, backgroundColor: 'var(--color-green)', borderRadius: '2px 2px 0 0', margin: '-40px -40px 32px' }} />

            {/* Icon */}
            <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'var(--color-green-soft)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Application received!
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 28 }}>
              We&apos;ve received your TradeSource application. Our team reviews every submission personally —
              no automated approvals. You&apos;ll hear back within{' '}
              <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>1–2 business days</strong>{' '}
              at the email you provided.
            </p>

            {/* What happens next */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>What happens next</p>
              {[
                { step: '1', text: 'Our team reviews every application personally — no automated approvals' },
                { step: '2', text: 'You&apos;ll receive an email decision within 1–2 business days' },
                { step: '3', text: 'Once approved, your full network access is activated — browse jobs, express interest, and post overflow work' },
              ].map(({ step, text }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-blue-soft)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--color-blue)', flexShrink: 0 }}>
                    {step}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.55, margin: 0, paddingTop: 2 }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Post-approval benefit preview */}
            <div style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>What approved members can do</p>
              {[
                'Post overflow work to the network',
                'Express interest in open jobs',
                'Build a rating and reputation',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/jobs" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', minWidth: 120 }}>
                Browse Open Jobs
              </a>
              <a href="/" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--color-divider)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', minWidth: 120 }}>
                Back to Home
              </a>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--color-input-placeholder)', textAlign: 'center', marginTop: 20 }}>
            Questions? Email{' '}
            <a href="mailto:info@tradesource.app" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>
              info@tradesource.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useUserAccess } from '@/lib/auth/access.client'

type PendingPageClientProps = {
  isJustSubmitted: boolean
}

function PendingNav() {
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

function SignInCTA() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PendingNav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ backgroundColor: 'var(--color-bg-alt)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '40px', boxShadow: 'var(--ts-shadow-card-hover)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 12 }}>
              Sign in to check your application
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>
              If you have an account, sign in to view your application status.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/founder-login" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', minWidth: 120, boxShadow: 'var(--ts-shadow-card)', transition: 'background 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue-hover)'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue)'; el.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)' }}>
                Sign In
              </a>
              <a href="/apply" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', minWidth: 120 }}>
                Apply to Join
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmittedConfirmation() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PendingNav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ backgroundColor: 'var(--color-bg-alt)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '40px', boxShadow: 'var(--ts-shadow-card-hover)', overflow: 'hidden' }}>

            {/* Green accent bar */}
            <div style={{ height: 4, backgroundColor: 'var(--color-green)', borderRadius: '2px 2px 0 0', margin: '-40px -40px 32px' }} />

            {/* Icon */}
            <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: 'var(--color-green-soft)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Application received!
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 28 }}>
              We&apos;ve received your TradeSource application. Our team reviews every submission personally.
              {' '}You&apos;ll hear back within{' '}
              <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>1–2 business days</strong>{' '}at the email you provided.
            </p>

            {/* What happens next — trust-building: specific, personal, no hype */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px', marginBottom: 28 }}>
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
              marginBottom: 28,
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
              <a href="/jobs" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: 'var(--ts-shadow-card)', minWidth: 120, transition: 'background 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue-hover)'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue)'; el.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)' }}>
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

function PendingContent({ user }: { user: any }) {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PendingNav />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ backgroundColor: 'var(--color-bg-alt)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '40px', boxShadow: 'var(--ts-shadow-card-hover)', overflow: 'hidden' }}>
            <div style={{ height: 4, backgroundColor: 'var(--color-blue)', borderRadius: '2px 2px 0 0', margin: '-40px -40px 32px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Application Under Review
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 28 }}>
              Our team reviews every application personally. You&apos;ll hear from us within{' '}
              <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>1–2 business days</strong>.
            </p>
            {user && (
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                  {[
                    { label: 'Name', value: user.full_name || user.name || '—' },
                    { label: 'Business', value: user.business_name || user.company || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-input-placeholder)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>Pending Review</span>
                </div>
              </div>
            )}
            <div style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>While you wait:</strong>{' '}Browse the{' '}
                <a href="/jobs" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}>open jobs</a>{' '}
                to see what the network looks like. Once approved, you can also{' '}
                <a href="/post-job" style={{ color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>post your own overflow work</a>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/jobs" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: 'var(--ts-shadow-card)', minWidth: 120, transition: 'background 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue-hover)'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue)'; el.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)' }}>
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

export default function PendingPageClient({ isJustSubmitted }: PendingPageClientProps) {
  const access = useUserAccess()
  const user = access.profile

  if (!access.checked) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', margin: '0 auto 16px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: 'var(--color-blue)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Checking your application&hellip;</p>
        </div>
      </div>
    )
  }

  // User just submitted (not signed in yet — submitted=true from the apply form)
  if (isJustSubmitted) {
    return <SubmittedConfirmation />
  }

  // Signed out
  if (!access.isAuthenticated) {
    return <SignInCTA />
  }

  // Signed in — show pending status (covers all signed-in states)
  return <PendingContent user={user} />
}
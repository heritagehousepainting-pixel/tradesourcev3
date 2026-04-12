'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signIn } from '@/lib/auth/client'

/** The page shell — required export. The actual form is in FounderForm below. */
export default function FounderLoginPage() {
  // Redirect already-authenticated users away from founder-login.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) return
      const userEmail = data.session.user.email || ''
      const founderEmails = (process.env.NEXT_PUBLIC_FOUNDER_EMAILS || '')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean)
      const isFounderEmail = founderEmails.includes(userEmail.toLowerCase())
      let isJwtAdmin = false
      try {
        const token = data.session.access_token
        const payload = token.split('.')[1]
        if (payload) {
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
          const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
          const decoded = JSON.parse(atob(padded))
          isJwtAdmin = (decoded.app_metadata as Record<string, unknown>)?.role === 'admin'
        }
      } catch {}
      window.location.href = isFounderEmail || isJwtAdmin ? '/admin' : '/dashboard'
    })
  }, [])

  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexDirection: 'column',
        padding: 24,
      }}>
        {/* Brand mark */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: 'var(--color-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
          opacity: 0.9,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {/* Spinner */}
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-blue)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <FounderForm />
    </Suspense>
  )
}

/** Inner form — uses useSearchParams; safe inside Suspense boundary. */
function FounderForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const adminRequired = searchParams.get('reason') === 'admin_required'
  const redirectTo = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError('')

    try {
      const { error: authError } = await signIn(email.trim(), password)

      if (authError) {
        const msg = authError.message?.toLowerCase()
        if (msg?.includes('invalid login')) {
          setError('Invalid email or password.')
        } else if (msg?.includes('email not confirmed')) {
          setError('Please confirm your email address before signing in.')
        } else {
          setError(authError.message || 'Sign in failed. Please try again.')
        }
        setLoading(false)
        return
      }

      const founderEmails = (process.env.NEXT_PUBLIC_FOUNDER_EMAILS || '')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean)
      const isFounderEmail = founderEmails.includes(email.trim().toLowerCase())
      window.location.href = isFounderEmail ? '/admin' : '/dashboard'
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: 'var(--color-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 20px var(--color-blue)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>TradeSource</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontWeight: 500 }}>Founder Access</div>
        </div>

        {/* Card — adapts to theme via globals.css .form-card */}
        <div className="form-card" style={{ padding: '28px 24px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="info@tradesource.app"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-input-border)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-input-text)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-input-border)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-input-text)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
              />
            </div>

            {(adminRequired || redirectTo) && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: 'var(--color-blue-soft)',
                border: '1px solid var(--color-blue)',
                color: 'var(--color-blue)',
                fontSize: 12,
                fontWeight: 500,
              }}>
                {adminRequired
                  ? 'Admin access required. Sign in with your founder account.'
                  : 'Please sign in to continue.'}
              </div>
            )}

            {(() => {
              const suspended = searchParams.get('reason') === 'account_suspended'
              const revoked = searchParams.get('reason') === 'account_revoked'
              if (!suspended && !revoked) return null
              return (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: suspended ? 'var(--color-orange)' : 'var(--color-red-soft)',
                  border: `1px solid ${suspended ? 'var(--color-orange)' : 'var(--color-red)'}`,
                  color: suspended ? '#fff' : 'var(--color-red)',
                  fontSize: 12,
                  fontWeight: 500,
                }}>
                  {suspended
                    ? 'Your account has been suspended. Contact support for assistance.'
                    : 'Your account access has been revoked.'}
                </div>
              )
            })()}

            {error && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: 'var(--color-red-soft)',
                border: '1px solid var(--color-red)',
                color: 'var(--color-red)',
                fontSize: 12,
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--color-blue)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: (loading || !email.trim() || !password) ? 'not-allowed' : 'pointer',
                opacity: (loading || !email.trim() || !password) ? 0.6 : 1,
                transition: 'opacity 0.15s, background-color 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading && email.trim() && password) (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-blue-hover)' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-blue)' }}
            >
              {loading ? 'Signing in\u2026' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          Internal access only. TradeSource Phase 1.
        </p>
      </div>
    </div>
  )
}
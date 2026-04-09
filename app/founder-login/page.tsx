'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth/client'

/**
 * The page shell — required export. The actual form is in FounderForm below,
 * wrapped in Suspense so useSearchParams (a client-only hook) doesn't break
 * static prerendering.
 */
export default function FounderLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0F172A' }} />}>
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

      window.location.href = '/dashboard'
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
      backgroundColor: '#0F172A',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>TradeSource</div>
          <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', fontWeight: 500 }}>Founder Access</div>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: '28px 24px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="heritagehousepainting@gmail.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
              />
            </div>

            {(adminRequired || redirectTo) && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: 12,
                fontWeight: 500,
              }}>
                {adminRequired
                  ? 'Admin access required. Sign in with your founder account.'
                  : 'Please sign in to continue.'}
              </div>
            )}

            {error && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
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
                backgroundColor: '#2563EB',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: (loading || !email.trim() || !password) ? 'not-allowed' : 'pointer',
                opacity: (loading || !email.trim() || !password) ? 0.6 : 1,
                transition: 'opacity 0.15s, background-color 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading && email.trim() && password) (e.target as HTMLButtonElement).style.backgroundColor = '#1D4ED8' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          Internal access only. TradeSource Phase 1.
        </p>
      </div>
    </div>
  )
}

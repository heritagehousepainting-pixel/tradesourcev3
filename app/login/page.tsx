'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        // Decode the JWT from the session directly to determine the user's role.
        // This avoids an extra network round-trip to the Supabase Auth server.
        let isFounder = false
        try {
          const token = data?.session?.access_token
          if (token) {
            const payload = token.split('.')[1]
            if (payload) {
              const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
              const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
              const decoded = JSON.parse(atob(padded))
              isFounder = (decoded.app_metadata as Record<string, unknown>)?.role === 'admin'
            }
          }
        } catch {
          // JWT decode failed — fall through to non-founder redirect
        }
        // Short delay to ensure the session cookie is fully written.
        await new Promise(r => setTimeout(r, 200))
        window.location.href = isFounder ? '/admin' : '/dashboard'
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>

      {/* ─── Left Panel — Dark branding ─── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '42%',
          padding: '48px 56px',
          backgroundColor: 'var(--color-bg-alt)',
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />

        {/* Top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>TradeSource</span>
        </div>

        {/* Middle */}
        <div>
          <div style={{ width: 32, height: 3, borderRadius: 2, backgroundColor: 'var(--color-orange)', marginBottom: 20 }} />
          <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Your network<br />
            <span style={{ color: 'var(--color-blue)' }}>of vetted painters.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
            Sign in to access overflow work in Montgomery, Bucks, and Delaware Counties and Philadelphia. Fixed price. No bidding. Private.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'check', text: 'Access your open job interests' },
              { icon: 'check', text: 'Message contractors directly' },
              { icon: 'check', text: 'Track your active and completed work' },
            ].map(({ text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-green-soft)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div>
          <p style={{ fontSize: 12, color: 'var(--color-input-placeholder)', marginBottom: 8 }}>New to TradeSource?</p>
          <a href="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none' }}>
            Apply to join the network →
          </a>
        </div>
      </div>

      {/* ─── Right Panel — Form ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 48px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Sign in to your TradeSource account.
            </p>
          </div>

          {/* Form card */}
          <div className="form-card" style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 40px var(--color-shadow-lg)',
          }}>
            {/* Blue accent bar */}
            <div style={{ height: 4, backgroundColor: 'var(--color-blue)' }} />

            <div style={{ padding: '28px 32px' }}>

              {error && (
                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                  />
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Password
                    </label>
                    <a href="#" style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-blue)', textDecoration: 'none' }}>
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    backgroundColor: loading ? 'var(--color-blue)' : 'var(--color-blue)',
                    border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 14px var(--color-shadow)',
                    letterSpacing: '0.01em',
                    transition: 'all 0.15s',
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'block', animation: 'spin 1s linear infinite' }} />
                      Signing in…
                    </span>
                  ) : 'Sign In'}
                </button>

              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-surface)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>or</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-surface)' }} />
              </div>

              {/* Apply CTA */}
              <div style={{ textAlign: 'center', paddingBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Don&apos;t have an account? </span>
                <a href="/apply" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none' }}>Apply to join</a>
              </div>

            </div>
          </div>

          {/* Security line */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
              Your information is encrypted and private.
            </span>
          </div>

        </div>
      </div>

    </div>
  )
}

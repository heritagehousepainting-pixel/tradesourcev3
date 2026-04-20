'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signIn } from '@/lib/auth/client'

/** Page shell — handles the authenticated-redirect and Suspense boundary. */
export default function FounderLoginPage() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) return
      const userEmail = data.session.user.email || ''
      const founderEmails = (process.env.NEXT_PUBLIC_FOUNDER_EMAILS || '')
        .split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
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
    <Suspense fallback={<SigninLoading />}>
      <FounderForm />
    </Suspense>
  )
}

function SigninLoading() {
  return (
    <div className="ts-signin">
      <div className="ts-signin-wash" aria-hidden="true" />
      <div className="ts-signin-center">
        <div className="ts-signin-brand"><a href="/" className="ts-nav-brand">Trade<span>Source</span></a></div>
        <div className="ts-signin-spinner" />
      </div>
    </div>
  )
}

function FounderForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const adminRequired = searchParams.get('reason') === 'admin_required'
  const redirectTo = searchParams.get('redirect')
  const suspended = searchParams.get('reason') === 'account_suspended'
  const revoked = searchParams.get('reason') === 'account_revoked'

  const canSubmit = !loading && email.trim() && password

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true); setError('')

    try {
      const founderEmails = (process.env.NEXT_PUBLIC_FOUNDER_EMAILS || '')
        .split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
      const isFounderEmail = founderEmails.includes(email.trim().toLowerCase())

      if (isFounderEmail) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Sign in failed. Please try again.')
          setLoading(false); return
        }
        window.location.href = data.redirectTo || '/admin'
        return
      }

      const { error: authError } = await signIn(email.trim(), password)
      if (authError) {
        const msg = authError.message?.toLowerCase()
        if (msg?.includes('invalid login')) setError('Invalid email or password.')
        else if (msg?.includes('email not confirmed')) setError('Please confirm your email address before signing in.')
        else setError(authError.message || 'Sign in failed. Please try again.')
        setLoading(false); return
      }
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="ts-signin">
      <div className="ts-signin-wash" aria-hidden="true" />

      <div className="ts-signin-center">
        <div className="ts-signin-brand">
          <a href="/" className="ts-nav-brand">Trade<span>Source</span></a>
        </div>

        <div className="ts-signin-header">
          <div className="ts-hero-kicker">Sign in</div>
          <h1 className="ts-signin-title">Welcome back.</h1>
          <p className="ts-signin-sub">Access the private network.</p>
        </div>

        <form onSubmit={handleLogin} className="ts-signin-form">
          <label className="ts-signin-field">
            <span className="ts-signin-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="ts-signin-input"
            />
          </label>

          <label className="ts-signin-field">
            <span className="ts-signin-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              required
              autoComplete="current-password"
              className="ts-signin-input"
            />
          </label>

          {(adminRequired || redirectTo) && (
            <div className="ts-signin-info">
              {adminRequired
                ? 'Admin access required. Sign in with your founder account.'
                : 'Please sign in to continue.'}
            </div>
          )}

          {suspended && (
            <div className="ts-signin-warn">
              Your account has been suspended. Contact support for assistance.
            </div>
          )}
          {revoked && (
            <div className="ts-signin-error">Your account access has been revoked.</div>
          )}
          {error && <div className="ts-signin-error">{error}</div>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="ts-signin-submit"
          >
            {loading ? (
              <span className="ts-spinner" />
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </>
            )}
          </button>
        </form>

        <p className="ts-signin-foot">
          Don&apos;t have access yet? <a href="/apply">Apply to join</a>
        </p>
      </div>
    </div>
  )
}

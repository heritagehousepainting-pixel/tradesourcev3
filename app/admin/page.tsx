'use client'

import { useState, useEffect } from 'react'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useUserAccess } from '@/lib/auth/access.client'
import { signIn } from '@/lib/auth/client'

/**
 * TradeSource Application Portal (admin page).
 *
 * Auth gate:
 *   - Canonical: access.canViewApplicationPortal (founder only)
 *   - Shows LoginForm if not signed in or not a founder
 *   - Shows portal content if founder
 *
 * Auth truth: Supabase Auth session + canonical access model.
 * No localStorage tokens, no FOUNDERS map, no hardcoded credentials.
 */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending_review: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Pending Review' },
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Pending' },
    approved: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Approved' },
    rejected: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Rejected' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color }} />
      {s.label}
    </span>
  )
}

function StatCard({ count, label, accent }: { count: number; label: string; accent?: string }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: accent || 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Tab = 'pending' | 'approved' | 'rejected'

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    try {
      const { error: authError } = await signIn(email.trim(), password)
      if (authError) {
        const msg = authError.message?.toLowerCase() || ''
        if (msg.includes('invalid login')) {
          setError('Invalid email or password.')
        } else if (msg.includes('email not confirmed')) {
          setError('Please confirm your email address before signing in.')
        } else {
          setError(authError.message || 'Sign in failed.')
        }
      }
      // On success: Supabase session is set. useUserAccess() picks it up from cookies.
      // Parent re-renders with updated access. No manual redirect needed.
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>TradeSource</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 6 }}>Application Portal</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>Sign in to review and manage contractor applications.</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@tradesource.co"
              autoComplete="email"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-blue)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, fontSize: 14, backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-blue)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', cursor: loading || !email.trim() || !password ? 'not-allowed' : 'pointer', opacity: loading || !email.trim() || !password ? 0.6 : 1, transition: 'opacity 0.15s', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Portal Content ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const access = useUserAccess()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  // Load users once the user has access
  useEffect(() => {
    if (!access.canViewApplicationPortal) return
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [access.canViewApplicationPortal])

  // Loading state — show empty page while auth resolves
  if (!access.checked) return null

  // Gate: not authorized → show login form
  if (!access.canViewApplicationPortal) {
    return <LoginForm />
  }

  const handleApprove = async (userId: string, verifyLicense: boolean, verifyInsurance: boolean) => {
    setProcessing(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', verified_license: verifyLicense, verified_insurance: verifyInsurance, verified_w9: true }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'approved', verified_license: verifyLicense, verified_insurance: verifyInsurance } : u))
        showToast('Application approved.')
      } else {
        showToast('Failed to approve.')
      }
    } catch { showToast('Failed to approve.') }
    setProcessing(null)
  }

  const handleReject = async (userId: string) => {
    setProcessing(userId)
    setRejectingId(null)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected' } : u))
        showToast('Application rejected.')
      } else {
        showToast('Failed to reject.')
      }
    } catch { showToast('Failed to reject.') }
    setProcessing(null)
  }

  const showToast = (msg: string) => {
    setToast({ msg, type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  const pending = users.filter(u => u.status === 'pending_review' || u.status === 'pending')
  const approved = users.filter(u => u.status === 'approved')
  const rejected = users.filter(u => u.status === 'rejected')
  const displayed = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, backgroundColor: 'var(--color-green)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: 'var(--color-nav)', borderBottom: '1px solid var(--color-nav-border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <a href="/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', letterSpacing: '-0.01em' }}>TradeSource</a>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 4 }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Application Portal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                {access.email}
              </span>
              <a href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>← Back to Dashboard</a>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 6 }}>Application Portal</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Review and manage contractor applications.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          <StatCard count={users.length} label="Total" />
          <StatCard count={approved.length} label="Approved" accent="var(--color-green)" />
          <StatCard count={pending.length} label="Pending Review" accent="var(--color-orange)" />
          <StatCard count={rejected.length} label="Rejected" accent="var(--color-red)" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
          {(['pending', 'approved', 'rejected'] as Tab[]).map(t => {
            const count = t === 'pending' ? pending.length : t === 'approved' ? approved.length : rejected.length
            return (
              <button
                key={t}
                onClick={() => { setTab(t); setExpandedId(null) }}
                style={{
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: '2px solid transparent',
                  marginBottom: -1,
                  backgroundColor: 'transparent',
                  color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)',
                  borderBottomColor: tab === t ? 'var(--color-blue)' : 'transparent',
                  transition: 'all 0.15s',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                {t === 'pending' ? 'Pending Review' : t === 'approved' ? 'Approved' : 'Rejected'}
                {count > 0 && (
                  <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: tab === t ? 'var(--color-blue)' : 'var(--color-surface-raised)', color: tab === t ? '#fff' : 'var(--color-text-muted)' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Applicant list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 72, borderRadius: 12, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', animation: 'pulse 2s ease-in-out infinite' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              {tab === 'pending' ? 'No pending applications.' : tab === 'approved' ? 'No approved contractors yet.' : 'No rejected applications.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayed.map(u => (
              <div key={u.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Row header */}
                <div
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                >
                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-blue)' }}>{(u.full_name || u.name || 'C').charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{u.full_name || u.name || '—'}</span>
                      <StatusBadge status={u.status} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {u.company || u.business_name || u.businessName || '—'}
                      {u.email && <span> · {u.email}</span>}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    {u.license_number && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                        License {u.license_state ? `· ${u.license_state}` : ''}
                      </span>
                    )}
                    {u.years_in_trade > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.years_in_trade}y</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{timeAgo(u.created_at)}</span>

                    {/* Actions (pending tab only) */}
                    {tab === 'pending' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleApprove(u.id, !!u.license_number, false)}
                          disabled={processing === u.id}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--color-green)', color: '#fff', border: 'none', cursor: processing === u.id ? 'not-allowed' : 'pointer', opacity: processing === u.id ? 0.6 : 1 }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setRejectingId(u.id); setExpandedId(u.id) }}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--color-red)', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Expand indicator */}
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2}
                      style={{ flexShrink: 0, transform: expandedId === u.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === u.id && (
                  <div style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', padding: '24px 20px' }}>

                    {/* Reject confirmation */}
                    {rejectingId === u.id && (
                      <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-red)' }}>Reject this application?</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setRejectingId(null); handleReject(u.id) }}
                            disabled={processing === u.id}
                            style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--color-red)', color: '#fff', border: 'none', cursor: processing === u.id ? 'not-allowed' : 'pointer', opacity: processing === u.id ? 0.6 : 1 }}
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Two-column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                      {/* Left: Application details */}
                      <div>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Application Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {[
                            ['Full Name', u.full_name || u.name],
                            ['Business', u.company || u.business_name || u.businessName],
                            ['Email', u.email],
                            ['Phone', u.phone],
                            ['License #', u.license_number || '—'],
                            ['License State', u.license_state || '—'],
                            ['Years in Trade', u.years_in_trade ? `${u.years_in_trade} years` : '—'],
                            ['Submitted', u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'],
                            ['Status', u.status],
                          ].map(([label, value]) => (
                            <div key={String(label)}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-input-placeholder)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', wordBreak: 'break-all' }}>{value || '—'}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Vetting checklist */}
                      <div>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Vetting Checklist</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {[
                            { label: 'Application Submitted', done: true },
                            { label: 'License Number Provided', done: !!u.license_number },
                            { label: 'License Verified', done: !!u.verified_license },
                            { label: 'Insurance Verified', done: !!u.verified_insurance },
                            { label: 'W-9 on File', done: !!u.verified_w9 },
                          ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.done ? 'var(--color-green)' : 'var(--color-surface)', border: item.done ? 'none' : '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {item.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span style={{ fontSize: 13, color: item.done ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: item.done ? 600 : 400 }}>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Document section */}
                        <div style={{ marginTop: 20 }}>
                          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Documents</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {u.w9_url ? (
                              <a href={u.w9_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-blue)' }}>W-9 / License Document</div>
                                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.license_state ? `${u.license_state} license` : 'View file'}</div>
                                </div>
                              </a>
                            ) : (
                              <div style={{ padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No W-9 / license document uploaded</span>
                              </div>
                            )}
                            {u.insurance_url && (
                              <a href={u.insurance_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-blue)' }}>Insurance Document</div>
                                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>View file</div>
                                </div>
                              </a>
                            )}
                          </div>
                        {/* Admin notes */}
                        <div style={{ marginTop: 20 }}>
                          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Admin Notes</h3>
                          <textarea
                            id={'admin-notes-' + u.id}
                            name="notes"
                            defaultValue={u.notes || ''}
                            placeholder="Add private notes about this applicant..."
                            rows={3}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, border: '1.5px solid var(--color-input-border)', resize: 'vertical', color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', outline: 'none' }}
                          />
                          <button
                            onClick={async () => {
                              const el = document.getElementById('admin-notes-' + u.id)
                              const notesVal = el && (el as HTMLTextAreaElement).value
                              if (!notesVal) return
                              try {
                                const res = await fetch('/api/users/' + u.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: notesVal }) })
                                if (res.ok) { const updated = await res.json(); setUsers(prev => prev.map(x => x.id === u.id ? { ...x, notes: updated.notes } : x)); showToast('Notes saved.') }
                                else showToast('Failed to save notes.')
                              } catch { showToast('Failed to save notes.') }
                            }}
                            style={{ marginTop: 8, padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', cursor: 'pointer' }}
                          >
                            Save Notes
                          </button>
                        </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    {tab === 'pending' && (
                      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10 }}>
                        <button
                          onClick={() => handleApprove(u.id, !!u.license_number, false)}
                          disabled={processing === u.id}
                          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, backgroundColor: 'var(--color-green)', color: '#fff', border: 'none', cursor: processing === u.id ? 'not-allowed' : 'pointer', opacity: processing === u.id ? 0.6 : 1, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                        >
                          {processing === u.id ? 'Processing…' : 'Approve Application'}
                        </button>
                        <button
                          onClick={() => { setRejectingId(u.id) }}
                          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, backgroundColor: 'var(--color-surface)', color: 'var(--color-red)', border: '1px solid var(--color-red)', cursor: 'pointer' }}
                        >
                          Reject Application
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingAssistant
        isLoggedIn={true}
        userRole="founder"
        route="/admin"
        pageTitle="Application Portal"
        pageDescription="Review contractor applications"
        pageStateSummary="admin application portal"
      />
    </div>
  )
}

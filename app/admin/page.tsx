'use client'

import { useState, useEffect } from 'react'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useUserAccess } from '@/lib/auth/access.client'
import { signIn } from '@/lib/auth/client'

/**
 * TradeSource Application Portal (admin).
 * Redesigned to match the premium homepage language:
 *   — dark atmospheric shell, restrained chrome
 *   — premium typography, operator-grade clarity
 *   — homepage-aligned pill buttons + segmented tabs
 *   — unified card / row / chip system (see .ts-app-* CSS)
 * Auth model and API surface are unchanged.
 */

type Tab = 'pending' | 'approved' | 'rejected' | 'suspended'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending_review: { cls: 'ts-chip--warn', label: 'Pending review' },
    pending:        { cls: 'ts-chip--warn', label: 'Pending' },
    approved:       { cls: 'ts-chip--ok',   label: 'Approved' },
    rejected:       { cls: 'ts-chip--err',  label: 'Rejected' },
    suspended:      { cls: 'ts-chip--warn', label: 'Suspended' },
    removed:        { cls: 'ts-chip--err',  label: 'Removed' },
  }
  const s = map[status] || map.pending
  return <span className={`ts-chip ${s.cls}`}>{s.label}</span>
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

// ─── Login gate ────────────────────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true); setError('')
    try {
      const { error: authError } = await signIn(email.trim(), password)
      if (authError) {
        const msg = authError.message?.toLowerCase() || ''
        if (msg.includes('invalid login')) setError('Invalid email or password.')
        else if (msg.includes('email not confirmed')) setError('Please confirm your email before signing in.')
        else setError(authError.message || 'Sign in failed.')
      }
    } catch { setError('An unexpected error occurred.') }
    finally { setLoading(false) }
  }

  return (
    <div className="ts-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="ts-page-kicker">Operator access</div>
        <h1 className="ts-page-title" style={{ marginBottom: 10 }}>Application <em>portal</em>.</h1>
        <p className="ts-page-sub" style={{ marginBottom: 32 }}>
          Sign in to review and manage contractor applications for the TradeSource network.
        </p>

        <form onSubmit={submit} className="ts-panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ts-field">
            <label className="ts-field-label" htmlFor="admin-email">Email</label>
            <input id="admin-email" className="ts-input" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="info@tradesource.app" />
          </div>
          <div className="ts-field">
            <label className="ts-field-label" htmlFor="admin-pass">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="admin-pass" className="ts-input" type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(248,250,252,0.55)', padding: 6 }}>
                {showPassword
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59M21 21l-3.59-3.59" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              </button>
            </div>
          </div>
          {error && (
            <div className="ts-chip ts-chip--err" style={{ alignSelf: 'stretch', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>{error}</div>
          )}
          <button type="submit" disabled={loading || !email.trim() || !password}
            className="ts-action ts-action--blue ts-action--lg" style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Admin portal ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const access = useUserAccess()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!access.checked) return null
  if (!access.canViewApplicationPortal) return <LoginForm />

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const updateUserStatus = async (userId: string, body: Record<string, unknown>, okMsg: string, errMsg: string) => {
    setProcessing(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...body } : u))
        showToast(okMsg)
      } else showToast(errMsg, 'error')
    } catch { showToast(errMsg, 'error') }
    setProcessing(null)
  }

  const handleApprove = (u: any) =>
    updateUserStatus(u.id, { status: 'approved', verified_license: !!u.license_number, verified_insurance: false, verified_w9: true }, 'Application approved.', 'Failed to approve.')
  const handleReject = (id: string) => { setRejectingId(null); return updateUserStatus(id, { status: 'rejected' }, 'Application rejected.', 'Failed to reject.') }
  const handleSuspend = (id: string) => updateUserStatus(id, { status: 'suspended' }, 'Contractor suspended.', 'Failed to suspend.')
  const handleRemove = (id: string) => {
    if (!confirm('Remove this contractor from the network?')) return
    return updateUserStatus(id, { status: 'removed' }, 'Contractor removed from network.', 'Failed to remove contractor.')
  }

  const pending   = users.filter(u => u.status === 'pending_review' || u.status === 'pending')
  const approved  = users.filter(u => u.status === 'approved')
  const rejected  = users.filter(u => u.status === 'rejected')
  const suspended = users.filter(u => u.status === 'suspended')
  const counts: Record<Tab, number> = { pending: pending.length, approved: approved.length, rejected: rejected.length, suspended: suspended.length }
  const displayed = tab === 'pending' ? pending : tab === 'approved' ? approved : tab === 'rejected' ? rejected : suspended

  return (
    <div className="ts-app">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          boxShadow: '0 14px 40px rgba(0,0,0,0.35)'
        }}>{toast.msg}</div>
      )}

      {/* Top nav */}
      <header className="ts-app-nav">
        <div className="ts-app-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" className="ts-app-brand">Trade<span>Source</span></a>
            <span className="ts-app-crumb">Application portal</span>
          </div>
          <div className="ts-app-nav-right">
            <span className="ts-app-nav-id">{access.email}</span>
            <a href="/dashboard" className="ts-app-nav-link">Dashboard →</a>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="ts-app-shell">
        {/* Heading */}
        <div className="ts-page-head">
          <div className="ts-page-kicker">Operator · phase 1</div>
          <h1 className="ts-page-title">Review who joins <em>the network</em>.</h1>
          <p className="ts-page-sub">
            Every contractor clears five checks before they can post, browse, or respond to work. Approve with intent.
          </p>
        </div>

        {/* Stats */}
        <div className="ts-stat-row" style={{ marginBottom: 32 }}>
          <div className="ts-stat">
            <div className="ts-stat-label">Total applicants</div>
            <div className="ts-stat-value">{users.length}</div>
          </div>
          <div className="ts-stat">
            <div className="ts-stat-label">Pending review</div>
            <div className="ts-stat-value ts-stat-value--warn">{pending.length}</div>
          </div>
          <div className="ts-stat">
            <div className="ts-stat-label">Approved</div>
            <div className="ts-stat-value ts-stat-value--ok">{approved.length}</div>
          </div>
          <div className="ts-stat">
            <div className="ts-stat-label">Rejected</div>
            <div className="ts-stat-value ts-stat-value--err">{rejected.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ts-segtabs" style={{ marginBottom: 20 }}>
          {(['pending', 'approved', 'rejected', 'suspended'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setExpandedId(null) }}
              className={`ts-segtab ${tab === t ? 'is-active' : ''}`}>
              {t === 'pending' ? 'Pending' : t === 'approved' ? 'Approved' : t === 'rejected' ? 'Rejected' : 'Suspended'}
              {counts[t] > 0 && <span className="ts-segtab-count">{counts[t]}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} className="ts-panel" style={{ height: 80, animation: 'pulse 2s ease-in-out infinite' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="ts-empty">
            <div className="ts-empty-title">
              {tab === 'pending' ? 'No applications awaiting review' :
               tab === 'approved' ? 'No approved contractors yet' :
               tab === 'rejected' ? 'No rejected applications' : 'No suspended contractors'}
            </div>
            <div className="ts-empty-sub">
              {tab === 'pending'
                ? 'New contractor applications will show up here the moment they submit.'
                : 'As the network grows, this list will reflect every decision you make.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayed.map(u => {
              const initials = (u.full_name || u.name || u.company || 'C').split(' ').map((p: string) => p[0]).join('').slice(0,2).toUpperCase()
              return (
                <div key={u.id} className="ts-panel" style={{ padding: 0 }}>
                  <div className="ts-row" style={{ background: 'transparent', border: 'none', borderRadius: 0, padding: '16px 22px', cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}>
                    <div className="ts-row-avatar">{initials}</div>
                    <div className="ts-row-main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span className="ts-row-title">{u.full_name || u.name || '—'}</span>
                        <StatusChip status={u.status} />
                      </div>
                      <div className="ts-row-meta">
                        <span>{u.company || u.business_name || u.businessName || '—'}</span>
                        {u.email && <><span className="ts-dot" /><span>{u.email}</span></>}
                        {u.years_in_trade > 0 && <><span className="ts-dot" /><span>{u.years_in_trade}y experience</span></>}
                        {u.license_state && <><span className="ts-dot" /><span>License · {u.license_state}</span></>}
                        <span className="ts-dot" /><span>{timeAgo(u.created_at)}</span>
                      </div>
                    </div>
                    <div className="ts-row-actions" onClick={e => e.stopPropagation()}>
                      {tab === 'pending' && (
                        <>
                          <button className="ts-action ts-action--success ts-action--sm"
                            onClick={() => handleApprove(u)} disabled={processing === u.id}>
                            Approve
                          </button>
                          <button className="ts-action ts-action--danger ts-action--sm"
                            onClick={() => { setRejectingId(u.id); setExpandedId(u.id) }}>
                            Reject
                          </button>
                        </>
                      )}
                      {tab === 'approved' && (
                        <>
                          <button className="ts-action ts-action--ghost ts-action--sm"
                            onClick={() => handleSuspend(u.id)} disabled={processing === u.id}>
                            Suspend
                          </button>
                          <button className="ts-action ts-action--danger ts-action--sm"
                            onClick={() => handleRemove(u.id)} disabled={processing === u.id}>
                            Remove
                          </button>
                        </>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        style={{ color: 'rgba(248,250,252,0.45)', transition: 'transform .2s', transform: expandedId === u.id ? 'rotate(180deg)' : 'none' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {expandedId === u.id && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 26px', background: 'rgba(0,0,0,0.15)' }}>
                      {rejectingId === u.id && (
                        <div className="ts-feature ts-feature--warn" style={{ padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#FCA5A5' }}>Reject this application?</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="ts-action ts-action--danger ts-action--sm"
                              onClick={() => handleReject(u.id)} disabled={processing === u.id}>
                              Confirm reject
                            </button>
                            <button className="ts-action ts-action--ghost ts-action--sm"
                              onClick={() => setRejectingId(null)}>Cancel</button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 28 }} className="admin-detail-grid">
                        {/* Details */}
                        <div>
                          <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Application details</div>
                          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', margin: 0 }}>
                            {[
                              ['Full name', u.full_name || u.name],
                              ['Business', u.company || u.business_name || u.businessName],
                              ['Email', u.email],
                              ['Phone', u.phone],
                              ['License #', u.license_number || '—'],
                              ['License state', u.license_state || '—'],
                              ['Experience', u.years_in_trade ? `${u.years_in_trade} years` : '—'],
                              ['Submitted', u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'],
                            ].map(([label, value]) => (
                              <div key={String(label)}>
                                <dt style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,250,252,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</dt>
                                <dd style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--color-text)', wordBreak: 'break-word' }}>{value || '—'}</dd>
                              </div>
                            ))}
                            {u.external_link && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <dt style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,250,252,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>External review</dt>
                                <dd style={{ margin: 0 }}>
                                  <a href={u.external_link} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: 13, fontWeight: 500, color: '#93C5FD', textDecoration: 'none', borderBottom: '1px solid rgba(147,197,253,0.3)' }}>
                                    {u.external_link}
                                  </a>
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>

                        {/* Checks + docs */}
                        <div>
                          <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Vetting checklist</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                              { label: 'Application submitted', done: true },
                              { label: 'License number provided', done: !!u.license_number },
                              { label: 'License verified', done: !!u.verified_license },
                              { label: 'Insurance verified', done: !!u.verified_insurance },
                              { label: 'W-9 on file', done: !!u.verified_w9 },
                            ].map(item => (
                              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  background: item.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                  border: item.done ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
                                  {item.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span style={{ fontSize: 13, color: item.done ? 'var(--color-text)' : 'rgba(248,250,252,0.5)', fontWeight: item.done ? 500 : 400 }}>{item.label}</span>
                              </div>
                            ))}
                          </div>

                          <div className="ts-section-eyebrow" style={{ margin: '22px 0 10px' }}>Documents</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {u.w9_url ? (
                              <a href={u.w9_url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: '#93C5FD' }}>W-9 / license document</div>
                                  <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.5)' }}>{u.license_state ? `${u.license_state} license` : 'View file'}</div>
                                </div>
                              </a>
                            ) : (
                              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px dashed rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(248,250,252,0.45)' }}>
                                No W-9 / license document uploaded.
                              </div>
                            )}
                            {u.insurance_url && (
                              <a href={u.insurance_url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: '#93C5FD' }}>Insurance document</div>
                                  <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.5)' }}>View file</div>
                                </div>
                              </a>
                            )}
                          </div>

                          <div className="ts-section-eyebrow" style={{ margin: '22px 0 10px' }}>Admin notes</div>
                          <textarea id={'admin-notes-' + u.id} defaultValue={u.notes || ''} rows={3} className="ts-textarea"
                            placeholder="Private notes about this applicant…" />
                          <button className="ts-action ts-action--ghost ts-action--sm" style={{ marginTop: 10 }}
                            onClick={async () => {
                              const el = document.getElementById('admin-notes-' + u.id) as HTMLTextAreaElement | null
                              const val = el?.value
                              if (val === undefined) return
                              try {
                                const res = await fetch('/api/users/' + u.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: val }) })
                                if (res.ok) { const up = await res.json(); setUsers(prev => prev.map(x => x.id === u.id ? { ...x, notes: up.notes } : x)); showToast('Notes saved.') }
                                else showToast('Failed to save notes.', 'error')
                              } catch { showToast('Failed to save notes.', 'error') }
                            }}>Save notes</button>
                        </div>
                      </div>

                      {tab === 'pending' && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button className="ts-action ts-action--success" disabled={processing === u.id}
                            onClick={() => handleApprove(u)}>
                            {processing === u.id ? 'Processing…' : 'Approve application'}
                          </button>
                          <button className="ts-action ts-action--danger"
                            onClick={() => setRejectingId(u.id)}>
                            Reject application
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 820px) {
          .admin-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

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

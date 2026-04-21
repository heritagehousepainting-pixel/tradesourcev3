'use client'

import { useState, useEffect, useRef } from 'react'
import { useNavContext } from '@/app/components/NavContext'

const PA_COUNTIES = ['Philadelphia', 'Montgomery County', 'Bucks County', 'Delaware County']
const TRADE_TYPES = [
  'Interior Painting',
  'Exterior Painting',
  'Cabinet Painting',
  'Drywall Repair',
  'Power Washing',
  'Staining',
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function ToggleChip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={`ts-toggle ${selected ? 'is-on' : ''}`}>
      {selected && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
      )}
      {label}
    </button>
  )
}

function parseArrayField(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return [] }
}

interface ProfileSectionProps {
  user: any
  onBack: () => void
}

export function ProfileSection({ user, onBack }: ProfileSectionProps) {
  const { handleSignOut: navHandleSignOut } = useNavContext()
  const [view, setView] = useState<'overview' | 'edit'>('overview')
  const [pendingEdit, setPendingEdit] = useState<any>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [editTradeTypes, setEditTradeTypes] = useState<string[]>([])
  const [editServiceAreas, setEditServiceAreas] = useState<string[]>([])
  const [editBio, setEditBio] = useState('')
  const [hasEdits, setHasEdits] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg); setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/profile-edit-requests?contractor_id=${user.id}`)
      .then(r => r.json())
      .then(data => { if (data && !data.error) setPendingEdit(data) })
      .catch(() => {})

    setEditForm({
      business_name: user.business_name || '',
      full_name: user.full_name || user.name || '',
      phone: user.phone || '',
      website: user.website || '',
      years_in_business: String(user.years_in_business || ''),
      email: user.email || '',
    })
    setEditTradeTypes(parseArrayField(user.trade_types))
    setEditServiceAreas(parseArrayField(user.service_areas))
    setEditBio(user.bio || '')
  }, [user?.id])

  const toggleArray = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
    setHasEdits(true)
  }

  const handleEditChange = (key: string, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value })); setHasEdits(true)
  }

  const handleSubmitEdits = async () => {
    if (!user?.id) return
    setSaving(true); setSubmitError('')
    try {
      const changes: Record<string, any> = {}
      const formFields = ['business_name', 'full_name', 'phone', 'website', 'years_in_business', 'email', 'bio']
      for (const field of formFields) {
        const editVal = field === 'bio' ? editBio : (editForm[field] ?? '')
        const origVal = field === 'bio' ? user?.bio : user?.[field]
        if (editVal !== String(origVal ?? '')) changes[field] = editVal
      }
      if (JSON.stringify(editTradeTypes) !== JSON.stringify(parseArrayField(user?.trade_types))) changes.trade_types = editTradeTypes
      if (JSON.stringify(editServiceAreas) !== JSON.stringify(parseArrayField(user?.service_areas))) changes.service_areas = editServiceAreas
      if (Object.keys(changes).length === 0) { showToast('No changes to submit.'); setSaving(false); return }
      const res = await fetch('/api/profile-edit-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: user.id, changes }),
      })
      const data = await res.json()
      if (res.ok) {
        setPendingEdit({ ...data, changes })
        setHasEdits(false); setView('overview')
        showToast('Edit submitted for admin approval.')
      } else setSubmitError(data?.error || 'Failed to submit edits.')
    } catch { setSubmitError('Network error. Please try again.') }
    finally { setSaving(false) }
  }

  const handleCancelEdits = async () => {
    if (!user?.id || !pendingEdit) return
    await fetch(`/api/profile-edit-requests?contractor_id=${user.id}`, { method: 'DELETE' })
    setPendingEdit(null); setHasEdits(false); setView('overview')
  }

  const handleSignOut = async () => {
    await navHandleSignOut(); window.location.href = '/'
  }

  const tradeTypes = parseArrayField(user?.trade_types)
  const serviceAreas = parseArrayField(user?.service_areas)
  const hasPending = !!pendingEdit
  const isApproved = user?.status === 'approved'

  // ── Edit view ────────────────────────────────────────────────
  if (view === 'edit') {
    return (
      <div style={{ maxWidth: 760 }}>
        <button onClick={() => { setView('overview'); setHasEdits(false) }}
          className="ts-action ts-action--ghost ts-action--sm" style={{ marginBottom: 20 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
          Back to profile
        </button>

        {hasPending && (
          <div className="ts-feature ts-feature--warn" style={{ padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: 12, color: '#FBBF24', fontWeight: 600 }}>
              You already have edits pending review. Submitting new changes will replace that request.
            </span>
          </div>
        )}

        <div className="ts-panel">
          <div className="ts-page-kicker" style={{ marginBottom: 6 }}>Profile edit</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: 6 }}>
            Update your profile
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.55)', marginBottom: 22 }}>
            Changes are submitted for admin approval before going live.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            {[
              { label: 'Business name', key: 'business_name' },
              { label: 'Contact name', key: 'full_name' },
              { label: 'Phone', key: 'phone' },
              { label: 'Website', key: 'website' },
              { label: 'Years in business', key: 'years_in_business' },
            ].map(field => (
              <div key={field.key} className="ts-field">
                <label className="ts-field-label">{field.label}</label>
                <input type="text" className="ts-input"
                  value={editForm[field.key] ?? ''}
                  onChange={e => handleEditChange(field.key, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="ts-field" style={{ marginBottom: 18 }}>
            <label className="ts-field-label">Business bio</label>
            <textarea className="ts-textarea" rows={3}
              value={editBio}
              onChange={e => { setEditBio(e.target.value); setHasEdits(true) }}
              placeholder="Describe your experience, specialties, the kinds of properties you work on most…" />
          </div>

          <div className="ts-field" style={{ marginBottom: 18 }}>
            <label className="ts-field-label">Service areas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PA_COUNTIES.map(county => (
                <ToggleChip key={county} label={county} selected={editServiceAreas.includes(county)}
                  onToggle={() => toggleArray(editServiceAreas, county, setEditServiceAreas)} />
              ))}
            </div>
          </div>

          <div className="ts-field" style={{ marginBottom: 22 }}>
            <label className="ts-field-label">Services offered</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRADE_TYPES.map(trade => (
                <ToggleChip key={trade} label={trade} selected={editTradeTypes.includes(trade)}
                  onToggle={() => toggleArray(editTradeTypes, trade, setEditTradeTypes)} />
              ))}
            </div>
          </div>

          {submitError && (
            <div className="ts-chip ts-chip--err" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { setView('overview'); setHasEdits(false) }} className="ts-action ts-action--ghost">
              Discard
            </button>
            <button onClick={handleSubmitEdits} disabled={saving} className="ts-action ts-action--blue">
              {saving ? (
                <>
                  <span style={{ display: 'block', width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  Submit for approval
                </>
              )}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(248,250,252,0.4)', textAlign: 'right', marginTop: 10 }}>
            Edits require admin approval before updating your live profile.
          </p>
        </div>
      </div>
    )
  }

  // ── Overview ─────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 760 }}>
      {toastVisible && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 99, padding: '12px 18px', borderRadius: 12, background: 'rgba(10,19,35,0.95)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#F8FAFC', boxShadow: '0 14px 40px rgba(0,0,0,0.4)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {toastMsg}
        </div>
      )}

      {hasPending && (
        <div className="ts-feature ts-feature--warn" style={{ padding: '16px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24', marginBottom: 2 }}>Edit pending admin review</div>
            <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.6)', lineHeight: 1.5 }}>
              {Object.keys(pendingEdit.changes || {}).length} change{Object.keys(pendingEdit.changes || {}).length !== 1 ? 's' : ''} submitted {timeAgo(pendingEdit.created_at)}. Your approved profile stays live until changes are reviewed.
            </div>
          </div>
          <button onClick={handleCancelEdits} className="ts-action ts-action--ghost ts-action--sm">Cancel request</button>
        </div>
      )}

      {/* Profile hero */}
      <div className="ts-panel" style={{ padding: '24px 26px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, minWidth: 240 }}>
            <div style={{
              width: 62, height: 62, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.2))',
              color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
              border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
              {(user?.full_name || user?.name || user?.business_name || 'C').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                  {user?.business_name || user?.full_name || user?.name || 'Contractor'}
                </h2>
                {isApproved && <span className="ts-chip ts-chip--ok">Verified</span>}
                {user?.years_in_business && <span className="ts-chip ts-chip--neutral ts-chip--plain">{user.years_in_business} years</span>}
              </div>
              {user?.bio && (
                <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.7)', lineHeight: 1.65, marginBottom: 10 }}>{user.bio}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'rgba(248,250,252,0.5)' }}>
                {user?.email && <span>{user.email}</span>}
                {user?.phone && <span>{user.phone}</span>}
                {user?.website && <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: '#93C5FD', textDecoration: 'none' }}>{user.website.replace(/^https?:\/\//, '')}</a>}
              </div>
            </div>
          </div>
          <button onClick={() => setView('edit')} className="ts-action ts-action--blue ts-action--sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
            </svg>
            Edit profile
          </button>
        </div>
      </div>

      {/* Business + verification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div className="ts-panel">
          <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Business information</div>
          <div className="ts-dl">
            {[
              ['Business', user?.business_name],
              ['Contact', user?.full_name || user?.name],
              ['Email', user?.email],
              ['Phone', user?.phone],
              ['Website', user?.website],
              ['Experience', user?.years_in_business ? `${user.years_in_business} years` : null],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label as string} className="ts-dl-row">
                <span className="ts-dl-label">{label}</span>
                <span className="ts-dl-value">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ts-panel">
          <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Verification</div>
          <div className="ts-dl">
            {[
              { label: 'W-9 on file', verified: user?.verified_w9 },
              { label: 'Insurance', verified: user?.verified_insurance },
              { label: 'PA license', verified: user?.verified_license },
            ].map(doc => (
              <div key={doc.label} className="ts-dl-row">
                <span className="ts-dl-label">{doc.label}</span>
                <span className={`ts-chip ${doc.verified ? 'ts-chip--ok' : 'ts-chip--warn'}`}>
                  {doc.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
            <div className="ts-dl-row">
              <span className="ts-dl-label">Account status</span>
              <span className={`ts-chip ${isApproved ? 'ts-chip--ok' : 'ts-chip--info'}`}>
                {isApproved ? 'Approved' : (user?.status || 'pending')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Service areas + specialties */}
      <div className="ts-panel" style={{ marginBottom: 16 }}>
        <div className="ts-section-eyebrow" style={{ marginBottom: 16 }}>Service areas &amp; specialties</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          <div>
            <div className="ts-field-label" style={{ marginBottom: 10 }}>Service areas</div>
            {serviceAreas.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {serviceAreas.map((a: string) => <span key={a} className="ts-chip ts-chip--ok">{a}</span>)}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'rgba(248,250,252,0.4)', fontStyle: 'italic' }}>Not set</span>
            )}
          </div>
          <div>
            <div className="ts-field-label" style={{ marginBottom: 10 }}>Specialties</div>
            {tradeTypes.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tradeTypes.map((t: string) => <span key={t} className="ts-chip ts-chip--info">{t}</span>)}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'rgba(248,250,252,0.4)', fontStyle: 'italic' }}>Not set</span>
            )}
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="ts-panel">
        <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Account</div>
        <div className="ts-dl">
          <div className="ts-dl-row">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Sign out of your account</div>
              <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.45)', marginTop: 2 }}>End this session on this device.</div>
            </div>
            <button onClick={handleSignOut} className="ts-action ts-action--ghost ts-action--sm">Sign out</button>
          </div>
          <div className="ts-dl-row">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Member since</div>
              <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.45)', marginTop: 2 }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(248,250,252,0.35)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              ID · {user?.id?.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

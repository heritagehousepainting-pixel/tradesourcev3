'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
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

function SectionCard({ title, children, accent }: { title?: string; children: React.ReactNode; accent?: 'blue' | 'green' | 'orange' }) {
  const borderColor = accent === 'green' ? 'var(--color-green)'
    : accent === 'orange' ? 'var(--color-orange)'
    : 'var(--color-blue)'
  return (
    <div style={{
      backgroundColor: 'var(--color-surface-raised)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 2px 12px var(--color-shadow)',
    }}>
      {title && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-divider)',
          display: 'flex', alignItems: 'center', gap: 10,
          borderLeft: `3px solid ${borderColor}`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {title}
          </span>
        </div>
      )}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function FieldRow({ label, value, pendingValue, badge }: {
  label: string
  value?: string | null
  pendingValue?: string | null
  badge?: React.ReactNode
}) {
  const hasPending = pendingValue !== undefined && pendingValue !== value
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 16, padding: '10px 0',
      borderBottom: '1px solid var(--color-divider)',
    }}>
      <div style={{ flex: '0 0 140px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        {hasPending ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textDecoration: 'line-through', opacity: 0.5 }}>
              {value || <span style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not set</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>{pendingValue}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                Pending
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: value ? 500 : 400 }}>
              {value || <span style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not set</span>}
            </span>
            {badge}
          </div>
        )}
      </div>
    </div>
  )
}

function EditField({ label, value, fieldKey, changes, onChange }: {
  label: string
  value: string
  fieldKey: string
  changes: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  const hasChanged = changes[fieldKey] !== undefined && changes[fieldKey] !== value
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={changes[fieldKey] ?? value}
          onChange={e => onChange(fieldKey, e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            fontSize: 13, fontFamily: 'inherit',
            border: hasChanged ? '1.5px solid #F59E0B' : '1.5px solid var(--color-input-border)',
            backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)',
            outline: 'none',
          }}
        />
        {hasChanged && (
          <div style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, fontWeight: 700, color: '#F59E0B',
          }}>
            Changed
          </div>
        )}
      </div>
    </div>
  )
}

function ToggleChip({ label, selected, onToggle }: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s',
        border: selected ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
        backgroundColor: selected ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
        color: selected ? 'var(--color-chip-checked-text)' : 'var(--color-chip-unchecked-text)',
        boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
      }}
    >
      {selected && <span style={{ marginRight: 5 }}>✓</span>}
      {label}
    </button>
  )
}

export default function ProfilePage() {
  // Canonical access for user data loading and sign-out.
  // useNavContext already fetched the profile via useUserAccess() — no duplicate auth call needed.
  const { access, handleSignOut: navHandleSignOut } = useNavContext()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'overview' | 'edit'>('overview')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastError, setToastError] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pendingEdit, setPendingEdit] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [editTradeTypes, setEditTradeTypes] = useState<string[]>([])
  const [editServiceAreas, setEditServiceAreas] = useState<string[]>([])
  const [editBio, setEditBio] = useState('')
  const [hasEdits, setHasEdits] = useState(false)
  const [editError, setEditError] = useState('')

  const showToast = (msg: string, isError = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setToastError(isError)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 4500)
  }

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  // Load user data using the canonical access.profile (from useNavContext).
  // useNavContext already fetched the profile via useUserAccess() — no duplicate auth call needed.
  useEffect(() => {
    if (!access.checked) return
    if (!access.isAuthenticated) {
      setLoading(false)
      return
    }

    const contractorId = access.profile?.id ?? null

    const doLoad = async () => {
      const [usersData, editReqData] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        contractorId ? fetch(`/api/profile-edit-requests?contractor_id=${contractorId}`).then(r => r.json()).catch(() => null) : Promise.resolve(null),
      ])

      if (contractorId) {
        const found = usersData.find((u: any) => String(u.id) === String(contractorId))
        if (found) {
          setUser(found)
          setProfile(found)
          setEditForm({
            business_name: found.business_name || '',
            full_name: found.full_name || '',
            phone: found.phone || '',
            website: found.website || '',
            years_in_business: String(found.years_in_business || ''),
            email: found.email || '',
          })
          setEditTradeTypes(found.trade_types ? (typeof found.trade_types === 'string' ? JSON.parse(found.trade_types) : found.trade_types) : [])
          setEditServiceAreas(found.service_areas ? (typeof found.service_areas === 'string' ? JSON.parse(found.service_areas) : found.service_areas) : [])
          setEditBio(found.bio || '')
        }
      }

      if (!user && !contractorId) {
        // Fallback: use the profile from access context
        if (access.profile) {
          setUser(access.profile)
          setProfile(access.profile)
        }
      }

      if (editReqData && !editReqData.error) {
        setPendingEdit(editReqData)
      }

      setLoading(false)
    }

    doLoad()
  }, [access.checked, access.isAuthenticated, access.profile])

  const toggleArray = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
    setHasEdits(true)
  }

  const handleEditChange = (key: string, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value }))
    setHasEdits(true)
  }

  const handleSubmitEdits = async () => {
    if (!user?.id) return
    setSaving(true)
    setEditError('')
    try {
      const changes: Record<string, any> = {}
      const formFields = ['business_name', 'full_name', 'phone', 'website', 'years_in_business', 'email', 'bio']
      for (const field of formFields) {
        const editVal = field === 'bio' ? editBio : (editForm[field] ?? '')
        const origVal = field === 'bio' ? profile?.bio : profile?.[field]
        if (editVal !== String(origVal ?? '')) {
          changes[field] = editVal
        }
      }
      if (JSON.stringify(editTradeTypes) !== JSON.stringify(profile?.trade_types || [])) {
        changes.trade_types = editTradeTypes
      }
      if (JSON.stringify(editServiceAreas) !== JSON.stringify(profile?.service_areas || [])) {
        changes.service_areas = editServiceAreas
      }

      if (Object.keys(changes).length === 0) {
        showToast('No changes to submit.')
        setSaving(false)
        return
      }

      const res = await fetch('/api/profile-edit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: user.id, changes }),
      })
      const data = await res.json()
      if (res.ok) {
        setPendingEdit({ ...data, changes })
        setHasEdits(false)
        setView('overview')
        showToast('Edit submitted for admin approval.')
      } else {
        setEditError(data?.error || 'Failed to submit edits.')
      }
    } catch {
      setEditError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdits = async () => {
    if (!user?.id || !pendingEdit) return
    await fetch(`/api/profile-edit-requests?contractor_id=${user.id}`, { method: 'DELETE' })
    setPendingEdit(null)
    setHasEdits(false)
    setView('overview')
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await navHandleSignOut()
    window.location.href = '/'
  }

  const parseArrayField = (val: any): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return [] }
  }

  const tradeTypes = parseArrayField(profile?.trade_types)
  const serviceAreas = parseArrayField(profile?.service_areas)
  const pendingTradeTypes = pendingEdit?.changes?.trade_types
  const pendingServiceAreas = pendingEdit?.changes?.service_areas
  const hasPending = !!pendingEdit

  const renderPendingBanner = () => {
    if (!hasPending) return null
    const changeCount = Object.keys(pendingEdit.changes || {}).length
    return (
      <div style={{
        padding: '14px 20px', borderRadius: 12,
        backgroundColor: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.2)',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 24,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          backgroundColor: 'rgba(245,158,11,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 2 }}>
            Edit pending admin review
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {changeCount} change{changeCount !== 1 ? 's' : ''} submitted {timeAgo(pendingEdit.created_at)} — an admin will review and approve shortly. Your approved profile stays live until approved.
          </div>
        </div>
        <button
          onClick={handleCancelEdits}
          style={{
            padding: '7px 14px', borderRadius: 8,
            backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Cancel Request
        </button>
      </div>
    )
  }

  // Auth gate — before loading check. Use canonical access state.
  if (!access.isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to view your profile</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>Access your TradeSource profile and manage your account.</p>
          <a href="/signin" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/jobs" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Browse Jobs</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            <div style={{ height: 200, borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', animation: 'pulse 2s ease-in-out infinite' }} />
            <div style={{ height: 200, borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', marginTop: 16, animation: 'pulse 2s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: 360, width: '100%', textAlign: 'center', padding: '40px 32px',
          backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)',
          borderRadius: 16, boxShadow: '0 8px 40px var(--color-shadow-lg)',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to view your profile</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>Access your account details, verification documents, and approval status.</p>
          <a href="/login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
        </div>
      </div>
    )
  }

  const profileTradeTypes = parseArrayField(profile?.trade_types)
  const profileServiceAreas = parseArrayField(profile?.service_areas)
  const status = profile?.status
  const isApproved = status === 'approved'

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99,
          padding: '14px 20px', borderRadius: 12,
          backgroundColor: toastError ? 'var(--color-red-soft)' : 'var(--color-surface-raised)',
          border: `1px solid ${toastError ? 'var(--color-red)' : 'var(--color-border)'}`,
          boxShadow: '0 8px 32px var(--color-shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 600,
          color: toastError ? 'var(--color-red)' : 'var(--color-text)',
        }}>
          {!toastError && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toastError && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toastMsg}
        </div>
      )}

      {/* ─── Header ─── */}
      <div style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)', padding: '36px 32px 28px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                My Profile
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Business information, verification, and account management.
              </p>
            </div>

            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {isApproved ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    ✓ Approved
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                    Joined {timeAgo(profile?.created_at)}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {status === 'pending' ? 'Pending Review' : status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab nav ─── */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 60, zIndex: 20 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', gap: 0, height: 52, alignItems: 'center' }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'edit', label: 'Edit Profile', badge: hasPending ? '!' : undefined },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key as typeof view)}
                style={{
                  padding: '0 20px', height: '100%',
                  fontSize: 13, fontWeight: view === tab.key ? 700 : 500,
                  color: view === tab.key ? 'var(--color-blue)' : 'var(--color-text-subtle)',
                  backgroundColor: 'transparent', border: 'none',
                  borderBottom: view === tab.key ? '2.5px solid var(--color-blue)' : '2.5px solid transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {tab.label}
                {tab.badge && (
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    backgroundColor: '#F59E0B', color: '#fff',
                    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '28px 32px 64px' }}>

        {/* ═══ OVERVIEW ═══ */}
        {view === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {renderPendingBanner()}

            {/* Profile hero */}
            <SectionCard>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 14,
                  backgroundColor: 'var(--color-blue-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 800, color: 'var(--color-blue)', flexShrink: 0,
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>
                  {(profile?.full_name || profile?.name || profile?.business_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                      {profile?.business_name || profile?.full_name || profile?.name || 'Contractor'}
                    </h2>
                    {isApproved && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    )}
                    {profile?.years_in_business && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                        {profile.years_in_business} yrs in business
                      </span>
                    )}
                  </div>
                  {profile?.bio && (
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 10 }}>
                      {profile.bio}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {profile?.email && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {profile.email}
                      </span>
                    )}
                    {profile?.phone && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.303 1.303a11 11 0 005.314 5.314l1.303-2.303a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {profile.phone}
                      </span>
                    )}
                    {profile?.website && (
                      <a href={profile.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Business info */}
            <SectionCard title="Business Information">
              <FieldRow label="Business Name" value={profile?.business_name} />
              <FieldRow label="Contact Name" value={profile?.full_name || profile?.name} />
              <FieldRow label="Email" value={profile?.email} badge={
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>Verified</span>
              } />
              <FieldRow label="Phone" value={profile?.phone} />
              <FieldRow label="Website" value={profile?.website} />
              <FieldRow label="Years in Business" value={profile?.years_in_business ? `${profile.years_in_business} years` : undefined} />
            </SectionCard>

            {/* Service areas + specialties */}
            <SectionCard title="Service Areas &amp; Specialties" accent="green">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Service Areas
                  </p>
                  {profileServiceAreas.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {profileServiceAreas.map(area => (
                        <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{area}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not set</span>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Specialties
                  </p>
                  {profileTradeTypes.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {profileTradeTypes.map(trade => (
                        <span key={trade} style={{
                          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                          backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)',
                          border: '1px solid rgba(59,130,246,0.2)',
                        }}>
                          {trade}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not set</span>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Verification / Documents */}
            <SectionCard title="Verification &amp; Documents" accent="blue">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    label: 'W-9 Form',
                    value: profile?.w9_filename || profile?.w9_url,
                    verified: profile?.verified_w9,
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Proof of Insurance',
                    value: profile?.insurance_filename || profile?.insurance_url || profile?.insurance_carrier,
                    verified: profile?.verified_insurance,
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'PA License',
                    value: profile?.license_number || 'PA Contractor',
                    verified: profile?.verified_license,
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.106-.54 3.42 3.42 0 014.438 0 3.42 3.42 0 001.106.54 3.42 3.42 0 01.583.69v3.8a3.42 3.42 0 01-.583.69 3.42 3.42 0 00-1.106.54 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.106-.54 3.42 3.42 0 01-.583-.69v-3.8a3.42 3.42 0 01.583-.69z" />
                      </svg>
                    ),
                  },
                ].map(doc => (
                  <div key={doc.label} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10,
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      backgroundColor: doc.verified ? 'var(--color-green-soft)' : 'var(--color-surface-raised)',
                      border: doc.verified ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: doc.verified ? 'var(--color-green)' : 'var(--color-text-muted)',
                    }}>
                      {doc.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                        {doc.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                        {doc.value || 'No document on file'}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {doc.verified ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)',
                          border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                          backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                          border: '1px solid rgba(245,158,11,0.2)',
                        }}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Account actions */}
            <SectionCard title="Account Actions" accent="orange">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Sign out of your account</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>End this session on this device.</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    style={{
                      padding: '8px 18px', borderRadius: 8,
                      backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 600,
                      cursor: signingOut ? 'default' : 'pointer',
                    }}
                  >
                    {signingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Member since</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                    ID: {profile?.id?.slice(0, 8)}
                  </span>
                </div>
              </div>
            </SectionCard>

          </div>
        )}

        {/* ═══ EDIT PROFILE ═══ */}
        {view === 'edit' && (
          <div>

            {/* Edit intro notice */}
            {hasPending && (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                backgroundColor: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.2)',
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                  You already have edits pending review. Submitting new changes will replace that request.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Business info edit */}
              <SectionCard title="Business Information">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <EditField label="Business Name" value={profile?.business_name || ''} fieldKey="business_name" changes={editForm} onChange={handleEditChange} />
                  <EditField label="Contact Name" value={profile?.full_name || ''} fieldKey="full_name" changes={editForm} onChange={handleEditChange} />
                  <EditField label="Phone" value={profile?.phone || ''} fieldKey="phone" changes={editForm} onChange={handleEditChange} />
                  <EditField label="Website" value={profile?.website || ''} fieldKey="website" changes={editForm} onChange={handleEditChange} />
                  <EditField label="Years in Business" value={String(profile?.years_in_business || '')} fieldKey="years_in_business" changes={editForm} onChange={handleEditChange} />
                </div>
              </SectionCard>

              {/* Bio */}
              <SectionCard title="Bio">
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Business Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={e => { setEditBio(e.target.value); setHasEdits(true) }}
                    rows={4}
                    placeholder="Describe your experience, specialties, types of properties you work on most…"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontFamily: 'inherit',
                      border: '1.5px solid var(--color-input-border)',
                      backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)',
                      outline: 'none', resize: 'vertical', lineHeight: 1.65,
                    }}
                  />
                  <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                    This bio is visible to other contractors and job posters in the network.
                  </p>
                </div>
              </SectionCard>

              {/* Service areas + specialties */}
              <SectionCard title="Service Areas &amp; Specialties">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                      Service Areas
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {PA_COUNTIES.map(county => (
                        <ToggleChip
                          key={county}
                          label={county}
                          selected={editServiceAreas.includes(county)}
                          onToggle={() => toggleArray(editServiceAreas, county, setEditServiceAreas)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                      Services Offered
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {TRADE_TYPES.map(trade => (
                        <ToggleChip
                          key={trade}
                          label={trade}
                          selected={editTradeTypes.includes(trade)}
                          onToggle={() => toggleArray(editTradeTypes, trade, setEditTradeTypes)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Submit */}
              {editError && (
                <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)' }}>
                  {editError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setView('overview'); setHasEdits(false) }}
                  style={{
                    padding: '11px 22px', borderRadius: 10,
                    backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSubmitEdits}
                  disabled={saving}
                  style={{
                    padding: '11px 24px', borderRadius: 10,
                    backgroundColor: 'var(--color-blue)', color: '#fff',
                    border: 'none', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    opacity: saving ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {saving ? (
                    <>
                      <span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit for Approval
                    </>
                  )}
                </button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', textAlign: 'right', marginTop: -8 }}>
                Edits require admin approval before updating your live profile.
              </p>

            </div>
          </div>
        )}

      </div>

      <FloatingAssistant
        route="/profile"
        pageTitle="My Profile"
        pageDescription="Contractor profile page — manage business info, documents, verification status, and account"
        pageStateSummary="Viewing own profile — approved info, edit mode, pending changes, documents, verification"
        userRole="contractor"
        isLoggedIn={access.isAuthenticated}
      />
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
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
        padding: '6px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s',
        border: selected ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
        backgroundColor: selected ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
        color: selected ? 'var(--color-chip-checked-text)' : 'var(--color-chip-unchecked-text)',
        boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
      }}
    >
      {selected && <span style={{ marginRight: 5 }}>✓</span>}{label}
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

// ProfileSection is rendered by Dashboard which owns the user prop.
// Sign-out uses the canonical NavContext for consistency.
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
    setToastMsg(msg)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000)
  }

  useEffect(() => { return () => { if (toastTimer.current) clearTimeout(toastTimer.current) } }, [])

  // Load pending edit request and pre-fill edit form
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
    setEditForm(prev => ({ ...prev, [key]: value }))
    setHasEdits(true)
  }

  const handleSubmitEdits = async () => {
    if (!user?.id) return
    setSaving(true)
    setSubmitError('')
    try {
      const changes: Record<string, any> = {}
      const formFields = ['business_name', 'full_name', 'phone', 'website', 'years_in_business', 'email', 'bio']
      for (const field of formFields) {
        const editVal = field === 'bio' ? editBio : (editForm[field] ?? '')
        const origVal = field === 'bio' ? user?.bio : user?.[field]
        if (editVal !== String(origVal ?? '')) {
          changes[field] = editVal
        }
      }
      if (JSON.stringify(editTradeTypes) !== JSON.stringify(parseArrayField(user?.trade_types))) {
        changes.trade_types = editTradeTypes
      }
      if (JSON.stringify(editServiceAreas) !== JSON.stringify(parseArrayField(user?.service_areas))) {
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
        setSubmitError(data?.error || 'Failed to submit edits.')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
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
    await navHandleSignOut()
    window.location.href = '/'
  }

  const tradeTypes = parseArrayField(user?.trade_types)
  const serviceAreas = parseArrayField(user?.service_areas)
  const hasPending = !!pendingEdit
  const isApproved = user?.status === 'approved'

  const renderPendingBanner = () => {
    if (!hasPending) return null
    const changeCount = Object.keys(pendingEdit.changes || {}).length
    return (
      <div style={{
        padding: '14px 20px', borderRadius: 12,
        backgroundColor: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.2)',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20,
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

  // ─── EDIT VIEW ───
  if (view === 'edit') {
    return (
      <div style={{ maxWidth: 700 }}>
        {/* Edit notice */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => { setView('overview'); setHasEdits(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>

          {hasPending && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              backgroundColor: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                You already have edits pending review. Submitting new changes will replace that request.
              </span>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '24px', marginBottom: 16, borderLeft: '3px solid var(--color-blue)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Edit Profile
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Changes are submitted for admin approval before going live.
          </p>

          {/* Business info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Business Name', key: 'business_name', value: user?.business_name },
              { label: 'Contact Name', key: 'full_name', value: user?.full_name || user?.name },
              { label: 'Phone', key: 'phone', value: user?.phone },
              { label: 'Website', key: 'website', value: user?.website },
              { label: 'Years in Business', key: 'years_in_business', value: user?.years_in_business ? String(user.years_in_business) : '' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  value={editForm[field.key] ?? ''}
                  onChange={e => handleEditChange(field.key, e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 9,
                    fontSize: 13, fontFamily: 'inherit',
                    border: hasEdits ? '1.5px solid #F59E0B' : '1.5px solid var(--color-input-border)',
                    backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Business Bio
            </label>
            <textarea
              value={editBio}
              onChange={e => { setEditBio(e.target.value); setHasEdits(true) }}
              rows={3}
              placeholder="Describe your experience, specialties, types of properties you work on most…"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, fontFamily: 'inherit',
                border: hasEdits ? '1.5px solid #F59E0B' : '1.5px solid var(--color-input-border)',
                backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)',
                outline: 'none', resize: 'vertical', lineHeight: 1.65,
              }}
            />
          </div>

          {/* Service areas */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
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

          {/* Services */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
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

          {submitError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)', marginBottom: 14 }}>
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setView('overview'); setHasEdits(false) }}
              style={{ padding: '10px 18px', borderRadius: 9, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Discard Changes
            </button>
            <button
              onClick={handleSubmitEdits}
              disabled={saving}
              style={{
                padding: '10px 22px', borderRadius: 9,
                backgroundColor: 'var(--color-blue)', color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {saving ? (
                <>
                  <span style={{ display: 'block', width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                  Submitting…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit for Approval
                </>
              )}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', textAlign: 'right', marginTop: 8 }}>
            Edits require admin approval before updating your live profile.
          </p>
        </div>
      </div>
    )
  }

  // ─── OVERVIEW VIEW ───
  return (
    <div style={{ maxWidth: 700 }}>
      {toastVisible && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99,
          padding: '14px 20px', borderRadius: 12,
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px var(--color-shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toastMsg}
        </div>
      )}

      {renderPendingBanner()}

      {/* Profile hero */}
      <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '24px', marginBottom: 16, borderLeft: '3px solid var(--color-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', flex: 1 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              backgroundColor: 'var(--color-blue-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: 'var(--color-blue)',
              border: '1px solid rgba(59,130,246,0.2)', flexShrink: 0,
            }}>
              {(user?.full_name || user?.name || user?.business_name || 'C').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                  {user?.business_name || user?.full_name || user?.name || 'Contractor'}
                </h2>
                {isApproved && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    ✓ Verified
                  </span>
                )}
                {user?.years_in_business && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{user.years_in_business} yrs</span>
                )}
              </div>
              {user?.bio && (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 10 }}>
                  {user.bio}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {user?.email && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</span>}
                {user?.phone && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.phone}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={() => setView('edit')}
            style={{
              padding: '9px 18px', borderRadius: 9,
              backgroundColor: 'var(--color-blue)', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.829-2.829L9.172 15.657a4 4 0 01-.292.292L4 20.485a1 1 0 01-.707-.707V19a2 2 0 01.293-.707l4.243-4.243m5.486 5.486L21 10m0 0H4a2 2 0 01-2-2v-1a2 2 0 012-2h2.828l5.657-5.657" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Business info */}
        <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, borderLeft: '3px solid var(--color-blue)', paddingLeft: 8 }}>
            Business Information
          </h3>
          {[
            ['Business Name', user?.business_name],
            ['Contact', user?.full_name || user?.name],
            ['Email', user?.email],
            ['Phone', user?.phone],
            ['Website', user?.website],
            ['Years', user?.years_in_business ? `${user.years_in_business} years` : null],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text)', maxWidth: 160, textAlign: 'right' }}>{value as string}</span>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, borderLeft: '3px solid var(--color-green)', paddingLeft: 8 }}>
            Verification
          </h3>
          {[
            { label: 'W-9', verified: user?.verified_w9, detail: user?.w9_filename },
            { label: 'Insurance', verified: user?.verified_insurance, detail: user?.insurance_carrier },
            { label: 'PA License', verified: user?.verified_license, detail: user?.license_number },
          ].map(doc => (
            <div key={doc.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text)' }}>{doc.label}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                backgroundColor: doc.verified ? 'var(--color-green-soft)' : 'rgba(245,158,11,0.1)',
                color: doc.verified ? 'var(--color-green)' : '#F59E0B',
                border: `1px solid ${doc.verified ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
              }}>
                {doc.verified ? '✓ Verified' : 'Pending'}
              </span>
            </div>
          ))}
          <div style={{ paddingTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>Account status:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isApproved ? 'var(--color-green)' : 'var(--color-blue)' }}>
              {isApproved ? 'Approved' : user?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Service areas + specialties */}
      <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Service Areas &amp; Specialties
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Service Areas
            </p>
            {serviceAreas.length > 0 ? serviceAreas.map((a: string) => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-green)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--color-text)' }}>{a}</span>
              </div>
            )) : (
              <span style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not set</span>
            )}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Specialties
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tradeTypes.length > 0 ? tradeTypes.map((t: string) => (
                <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {t}
                </span>
              )) : (
                <span style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Not set</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Account Actions
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Sign out of your account</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>End this session on this device.</div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 18px', borderRadius: 9,
              backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Member since</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
            ID: {user?.id?.slice(0, 8)}
          </span>
        </div>
      </div>
    </div>
  )
}

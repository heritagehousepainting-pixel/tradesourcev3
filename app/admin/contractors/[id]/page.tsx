'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface ContractorProfile {
  id: string
  full_name: string
  name: string
  email: string
  phone: string
  company: string
  business_name: string
  trade_types: string
  service_areas: string
  bio: string
  status: string
  license_number: string
  license_state: string
  verified_license: boolean
  verified_insurance: boolean
  verified_w9: boolean
  verified_external: boolean
  is_pro: boolean
  created_at: string
  reviewed_at: string
  notes: string
  years_experience: number
  website_url: string
  external_review_url: string
}

interface Job {
  id: string
  title: string
  status: string
  trade_type: string
  service_area: string
  price_range: string
  created_at: string
  job_photos: { id: string; url: string }[]
}

interface Interest {
  id: string
  job_id: string
  created_at: string
  jobs: { title: string; status: string }
}

const STATUS_COLORS: Record<string, string> = {
  open: '#10b981',
  awarded: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#6b7280',
}

function parseJsonField(val: string | string[] | null): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return [] }
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ContractorDetailPage() {
  const params = useParams()
  const contractorId = params.id as string
  const [contractor, setContractor] = useState<ContractorProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  useEffect(() => {
    fetch(`/api/admin/contractors/${contractorId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || data.error) {
          setError(data?.error || 'Failed to load contractor.')
        } else {
          setContractor(data.contractor)
          setJobs(data.jobs || [])
          setInterests(data.interests || [])
        }
        setLoading(false)
      })
      .catch(() => { setError('Failed to load contractor.'); setLoading(false) })
  }, [contractorId])

  const handleSuspend = async () => {
    if (!suspendReason.trim()) { showToast('Please enter a reason.'); return }
    setProcessingAction(true)
    const res = await fetch(`/api/users/${contractorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended', notes: `Suspended: ${suspendReason.trim()}` }),
    })
    if (res.ok) {
      setContractor(prev => prev ? { ...prev, status: 'suspended' } : prev)
      setShowSuspendModal(false)
      setSuspendReason('')
      showToast('Contractor suspended.')
    } else {
      showToast('Failed to suspend.')
    }
    setProcessingAction(false)
  }

  const handleUnsuspend = async () => {
    setProcessingAction(true)
    const res = await fetch(`/api/users/${contractorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    if (res.ok) {
      setContractor(prev => prev ? { ...prev, status: 'approved' } : prev)
      showToast('Contractor reinstated.')
    } else {
      showToast('Failed to reinstate.')
    }
    setProcessingAction(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Loading contractor…</div>
    </div>
  )

  if (error || !contractor) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{error || 'Contractor not found.'}</p>
      <a href="/admin" style={{ color: 'var(--color-blue)', fontSize: 13 }}>← Back to Admin</a>
    </div>
  )

  const name = contractor.full_name || contractor.name || 'Unknown'
  const tradeTypes = parseJsonField(contractor.trade_types)
  const serviceAreas = parseJsonField(contractor.service_areas)
  const isSuspended = contractor.status === 'suspended'

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '32px 24px' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, backgroundColor: 'var(--color-green)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 28, width: 420, maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>Suspend {name}</h3>
            <p style={{ margin: '0 0 18px 0', fontSize: 13, color: 'var(--color-text-muted)' }}>Enter a reason for the record. This will appear in the activity log.</p>
            <textarea
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="e.g. Non-responsive on awarded job, license concerns, quality issues…"
              rows={4}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSuspendModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSuspend} disabled={processingAction} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: processingAction ? 'not-allowed' : 'pointer', opacity: processingAction ? 0.7 : 1 }}>
                {processingAction ? 'Suspending…' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13, textDecoration: 'none', width: 'fit-content' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Back to Admin
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700,
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{name}</h1>
                <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>{contractor.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: contractor.status === 'approved' ? 'rgba(16,185,129,0.1)' : contractor.status === 'suspended' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: contractor.status === 'approved' ? 'var(--color-green)' : contractor.status === 'suspended' ? '#ef4444' : '#f59e0b', textTransform: 'capitalize' }}>
                    {contractor.status}
                  </span>
                  {contractor.verified_license && <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>Licensed</span>}
                  {contractor.verified_insurance && <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>Insured</span>}
                  {contractor.is_pro && <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>Pro</span>}
                </div>
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isSuspended ? (
              <button onClick={() => setShowSuspendModal(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Suspend
              </button>
            ) : (
              <button onClick={handleUnsuspend} disabled={processingAction} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.08)', color: 'var(--color-green)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Reinstate
              </button>
            )}
          </div>
        </div>

        {/* Body grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* Left: Jobs + Interests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Posted Jobs */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 22 }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700 }}>Posted Jobs <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)' }}>({jobs.length})</span></h2>
              {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 8px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"/></svg>
                  No jobs posted yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ padding: '12px 14px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{job.title}</p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{job.trade_type || job.service_area}</span>
                            {job.price_range && <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 600 }}>{job.price_range}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 700, backgroundColor: `${STATUS_COLORS[job.status] || '#6b7280'}20`, color: STATUS_COLORS[job.status] || '#6b7280' }}>
                            {job.status?.replace('_', ' ')}
                          </span>
                          <p style={{ margin: '2px 0 0 0', fontSize: 10, color: 'var(--color-text-muted)' }}>{formatDate(job.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expressed Interests */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 22 }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700 }}>Expressed Interests <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)' }}>({interests.length})</span></h2>
              {interests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 8px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  No interests expressed yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {interests.map(int => (
                    <div key={int.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{int.jobs?.title || 'Unknown job'}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>Expressed {formatDate(int.created_at)}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, backgroundColor: `${STATUS_COLORS[int.jobs?.status] || '#6b7280'}20`, color: STATUS_COLORS[int.jobs?.status] || '#6b7280' }}>
                        {int.jobs?.status?.replace('_', ' ') || 'unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Profile details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Contact info */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Contact Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {contractor.email && <InfoRow label="Email" value={contractor.email} />}
                {contractor.phone && <InfoRow label="Phone" value={contractor.phone} />}
                {contractor.company || contractor.business_name ? <InfoRow label="Business" value={contractor.company || contractor.business_name} /> : null}
                {contractor.website_url && <InfoRow label="Website" value={contractor.website_url} />}
              </div>
            </div>

            {/* Trade Profile */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Trade Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tradeTypes.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Trade Types</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tradeTypes.map(t => <Tag key={t} label={t} color="#dbeafe" textColor="#1d4ed8" />)}
                    </div>
                  </div>
                )}
                {serviceAreas.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Service Areas</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {serviceAreas.map(a => <Tag key={a} label={a} color="rgba(16,185,129,0.1)" textColor="var(--color-green)" />)}
                    </div>
                  </div>
                )}
                {contractor.years_experience > 0 && <InfoRow label="Years Experience" value={`${contractor.years_experience} years`} />}
                {contractor.license_number && <InfoRow label="License" value={`${contractor.license_state || ''} ${contractor.license_number}`} />}
              </div>
            </div>

            {/* Vetting */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Vetting Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'License', done: !!contractor.verified_license },
                  { label: 'Insurance', done: !!contractor.verified_insurance },
                  { label: 'W-9', done: !!contractor.verified_w9 },
                  { label: 'External Reviews', done: !!contractor.verified_external },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: item.done ? 'var(--color-green)' : 'var(--color-surface-raised)', border: item.done ? 'none' : '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span style={{ fontSize: 12, color: item.done ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <InfoRow label="Applied" value={formatDate(contractor.created_at)} />
                {contractor.reviewed_at && <InfoRow label="Reviewed" value={formatDate(contractor.reviewed_at)} />}
                {contractor.notes && <InfoRow label="Notes" value={contractor.notes} />}
              </div>
              {contractor.external_review_url && (
                <a href={contractor.external_review_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', textDecoration: 'none', fontSize: 12, color: 'var(--color-blue)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  View External Reviews
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--color-text)', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

function Tag({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <span style={{ padding: '3px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 600, backgroundColor: color, color: textColor }}>
      {label}
    </span>
  )
}
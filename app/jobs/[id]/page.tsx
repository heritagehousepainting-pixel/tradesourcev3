'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import StarRating from '@/components/StarRating'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useNavContext } from '@/app/components/NavContext'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<any>(null)
  const [poster, setPoster] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { access } = useNavContext()
  const [expressingId, setExpressingId] = useState<string | null>(null)
  const [expressed, setExpressed] = useState(false)
  const [expressError, setExpressError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [reviewForm, setReviewForm] = useState<{ rating: number; comment: string }>({ rating: 0, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [localJob, setLocalJob] = useState<any>(null)

  // Fetch job data (uses canonical auth via useNavContext)
  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error || !data) {
          setError('Job not found.')
          setLoading(false)
          return
        }
        setJob(data)
        setLocalJob(data)
        if (data.poster_id) {
          fetch('/api/users').then(r => r.json()).then(users => {
            const contractor = users.find((u: any) => String(u.id) === String(data.poster_id))
            if (contractor) {
              setPoster({
                id: contractor.id,
                name: contractor.full_name || contractor.name,
                full_name: contractor.full_name,
                company: contractor.company,
                poster_id: data.poster_id,
                is_homeowner: false,
              })
            }
          })
        } else if (data.homeowner_name || data.homeowner_email) {
          setPoster({
            name: data.homeowner_name,
            email: data.homeowner_email,
            is_homeowner: true,
          })
        }

        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load job.')
        setLoading(false)
      })
  }, [id])

  const handleExpressInterest = async () => {
    if (!access.isAuthenticated) {
      setExpressError('Sign in to express interest in this job.')
      return
    }
    const contractorId = access.profile?.id
    setExpressingId(id)
    setExpressError('')
    try {
      const res = await fetch(`/api/jobs/${id}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId }),
      })
      if (res.ok) {
        setExpressed(true)
      } else {
        const data = await res.json().catch(() => ({}))
        if (data.already_interested) {
          setExpressed(true)
        } else {
          setExpressError(data.error || 'Failed to express interest.')
        }
      }
    } catch {
      setExpressError('Network error. Please try again.')
    } finally {
      setExpressingId(null)
    }
  }

  const effectiveJob = localJob ?? job

  const handleStatusUpdate = async (nextStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setLocalJob(updated)
        setJob(updated)
      }
    } catch {
      // silent fail
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.rating) return
    setReviewError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: effectiveJob?.poster_id || null,
          homeowner_name: access.profile?.full_name || access.profile?.name || 'Contractor',
          rating: reviewForm.rating,
          comment: reviewForm.comment || '',
          job_id: id,
        }),
      })
      if (res.ok) {
        setReviewSubmitted(true)
        setShowReviewForm(false)
      } else {
        const data = await res.json().catch(() => ({}))
        setReviewError(data.error || 'Failed to submit review.')
      }
    } catch {
      setReviewError('Network error. Please try again.')
    }
  }

  // Auth gate — before loading check. Use canonical access state.
  if (!access.checked) return null
  if (!access.isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to view job details</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>
            TradeSource is a private network — job details and contractor information are only visible to approved members.
          </p>
          <a href="/founder-login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/apply" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Apply to Join</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
        <header style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
              <a href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>Back to Jobs</span>
              </a>
              <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <a href="/post-job" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Post a Job</a>
                <a href="/apply" style={{ fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none' }}>
                  Apply to Join
                </a>
              </nav>
            </div>
          </div>
        </header>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: '24px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, animation: 'pulse 2s ease-in-out infinite' }}>
                <div style={{ height: 20, borderRadius: 4, backgroundColor: 'var(--color-divider)', width: '40%', marginBottom: 12 }} />
                <div style={{ height: 14, borderRadius: 4, backgroundColor: 'var(--color-surface)', width: '70%', marginBottom: 8 }} />
                <div style={{ height: 14, borderRadius: 4, backgroundColor: 'var(--color-surface)', width: '30%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
        <header style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
              <a href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>Back to Jobs</span>
              </a>
              <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <a href="/apply" style={{ fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none' }}>
                  Apply to Join
                </a>
              </nav>
            </div>
          </div>
        </header>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Job not found</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', marginBottom: 24 }}>This job may have been removed or is no longer available.</p>
          <a href="/jobs" style={{ display: 'inline-block', backgroundColor: 'var(--color-blue)', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Browse All Jobs</a>
        </div>
      </div>
    )
  }

  const isOwnJob = access.profile?.id === job.contractor_id
  const isAwardedContractor = access.profile?.id === job.contractor_id
  const canReviewPoster = !!effectiveJob?.poster_id

  if (!access.checked) return null
  if (!access.isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to view job details</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>
            TradeSource is a private network — job details and contractor information are only visible to approved members.
          </p>
          <a href="/founder-login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/apply" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Apply to Join</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* NAV */}
      <header style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
            <a href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>Back to Jobs</span>
            </a>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <a href="/post-job" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Post a Job</a>
              <a href="/apply" style={{ fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none' }}>
                Apply to Join
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

          {/* ─── LEFT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Title + meta */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: job.status === 'open' ? 'rgba(16,185,129,0.15)' : 'var(--color-blue-soft)', color: job.status === 'open' ? 'var(--color-green)' : 'var(--color-blue)', border: `1px solid ${job.status === 'open' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.25)'}` }}>
                  {job.status === 'open' ? 'Open' : job.status === 'awarded' ? 'Awarded' : job.status === 'in_progress' ? 'In Progress' : job.status}
                </span>
                {job.scope && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>
                    {job.scope}
                  </span>
                )}

                {job.created_at && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Posted {timeAgo(job.created_at)}</span>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
                {job.title}
              </h1>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                {job.area && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{job.area}</span>
                  </div>
                )}
                {job.property_type && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{job.property_type.charAt(0).toUpperCase() + job.property_type.slice(1)}</span>
                  </div>
                )}
                {job.sq_footage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>~{job.sq_footage} sq ft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px' }}>
              <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', marginBottom: 12 }}>Description</h2>
              <p style={{ fontSize: 14, color: 'rgba(248,250,252,0.65)', lineHeight: 1.75 }}>{job.description}</p>
            </div>

            {/* Structured Scope Fields */}
            {(() => {
              const sf = job as any
              const rows: { label: string; value: string }[] = [
                sf.property_type && { label: 'Property type', value: sf.property_type },
                sf.included_areas && { label: 'Included areas', value: sf.included_areas },
                sf.surfaces && { label: 'Surfaces', value: sf.surfaces },
                sf.prep_requirements && { label: 'Prep required', value: sf.prep_requirements },
                sf.repairs_needed && { label: 'Surface repairs', value: sf.repairs_needed },
                sf.occupancy && { label: 'Occupancy', value: sf.occupancy },
                sf.furniture && { label: 'Furniture', value: sf.furniture },
                sf.materials_notes && { label: 'Materials', value: sf.materials_notes },
                sf.finish_expectations && { label: 'Finish / sheen', value: sf.finish_expectations },
                sf.access_notes && { label: 'Access notes', value: sf.access_notes },
                sf.exclusions && { label: 'Exclusions', value: sf.exclusions },
                sf.special_instructions && { label: 'Special instructions', value: sf.special_instructions },
                sf.door_drawer_count && { label: 'Door / drawer count', value: sf.door_drawer_count },
                sf.current_finish && { label: 'Current finish', value: sf.current_finish },
                sf.on_site_off_site && { label: 'On-site / off-site', value: sf.on_site_off_site },
                sf.condition && { label: 'Cabinet condition', value: sf.condition },
                sf.reinstall_responsibility && { label: 'Reinstall responsibility', value: sf.reinstall_responsibility },
                sf.stories && { label: 'Stories', value: sf.stories },
                sf.peeling_priming && { label: 'Peeling / priming', value: sf.peeling_priming },
                sf.power_washing && { label: 'Power washing', value: sf.power_washing },
                sf.damage_extent && { label: 'Damage extent', value: sf.damage_extent },
                sf.texture_match && { label: 'Texture match', value: sf.texture_match },
              ].filter(Boolean) as { label: string; value: string }[]

              if (rows.length === 0) return null

              return (
                <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px' }}>
                  <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', marginBottom: 16 }}>Scope Details</h2>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', margin: 0 }}>
                    {rows.map(({ label, value }) => (
                      <div key={label}>
                        <dt style={{ fontSize: 11, fontWeight: 600, color: 'rgba(248,250,252,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</dt>
                        <dd style={{ fontSize: 13, color: 'rgba(248,250,252,0.85)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )
            })()}

            {/* Job Photos */}
            {((job.job_photos && job.job_photos.length > 0) || (job.photos && job.photos.length > 0)) && (
              <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px' }}>
                <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', marginBottom: 14 }}>Photos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {(job.job_photos || []).concat(job.photos || []).map((photo: any, i: number) => {
                    const url = typeof photo === 'string' ? photo : photo.url
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <img
                          src={url}
                          alt={`Job photo ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Poster */}
            {poster && (
              <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 24px' }}>
                <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', marginBottom: 14 }}>Posted by</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {poster.is_homeowner ? (
                    <>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        {(poster.name || 'H').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{poster.name || 'Contractor'}</div>
                        {poster.email && <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{poster.email}</div>}
                        <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.3)', marginTop: 2 }}>TradeSource Member</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-blue)' }}>
                        {(poster.full_name || poster.name || poster.company || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <a href={`/contractors/${poster.id}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>
                          {poster.full_name || poster.name || 'Contractor'}
                        </a>
                        {poster.company && poster.full_name && <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{poster.company}</div>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {poster.verified_license && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981' }}>License ✓</span>}
                          {poster.verified_insurance && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Insurance ✓</span>}
                          {poster.verified_w9 && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981' }}>W-9 ✓</span>}
                          {poster.rating && <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>★ {poster.rating}/5</span>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Contact (homeowner) */}
            {!poster && job.homeowner_name && (
              <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 24px' }}>
                <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', marginBottom: 14 }}>Contact</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {(job.homeowner_name || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{job.homeowner_name}</div>
                    {job.homeowner_email && <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{job.homeowner_email}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN — CTA SIDEBAR ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>

            {/* Price card */}
            <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden' }}>
              {job.budget_min ? (
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', marginBottom: 4 }}>Fixed Price</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-green)', letterSpacing: '-0.03em' }}>
                    ${job.budget_min.toLocaleString()}
                  </div>
                </div>
              ) : null}

              {/* Awarded contractor controls */}
              {isAwardedContractor && effectiveJob.status !== 'open' ? (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {effectiveJob.status === 'awarded' && (
                    <button
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={updatingStatus}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)', cursor: updatingStatus ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      {updatingStatus ? 'Starting…' : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.947-2.301a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start Work
                        </>
                      )}
                    </button>
                  )}
                  {effectiveJob.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={updatingStatus}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', cursor: updatingStatus ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      {updatingStatus ? 'Completing…' : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Mark Complete
                        </>
                      )}
                    </button>
                  )}
                  {effectiveJob.status === 'completed' && canReviewPoster && !reviewSubmitted && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Leave a Review
                    </button>
                  )}
                  {effectiveJob.status === 'completed' && canReviewPoster && showReviewForm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Rate the job poster</p>
                      <StarRating
                        interactive
                        rating={reviewForm.rating}
                        size="lg"
                        onRate={(r) => setReviewForm(prev => ({ ...prev, rating: r }))}
                      />
                      <textarea
                        placeholder="Comment (optional)"
                        rows={2}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, backgroundColor: 'var(--color-divider)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', resize: 'vertical', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={handleSubmitReview}
                          disabled={!reviewForm.rating}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: reviewForm.rating ? 'var(--color-blue)' : 'var(--color-border)', color: reviewForm.rating ? '#fff' : 'rgba(248,250,252,0.3)', border: 'none', cursor: reviewForm.rating ? 'pointer' : 'default' }}
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--color-divider)', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                      {reviewError && <p style={{ fontSize: 12, color: '#FCA5A5' }}>{reviewError}</p>}
                    </div>
                  )}
                  {effectiveJob.status === 'completed' && reviewSubmitted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-green)' }}>Review submitted!</span>
                    </div>
                  )}
                </div>
              ) : job.status !== 'open' ? (
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>This job is no longer accepting interest.</div>
                  {job.contractor_id && <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.3)', marginTop: 4 }}>Awarded to a contractor.</div>}
                </div>
              ) : isOwnJob ? (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>This is your job.</p>
                  <a href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', textDecoration: 'none' }}>
                    Manage in Dashboard
                  </a>
                </div>
              ) : (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    onClick={handleExpressInterest}
                    disabled={expressingId === id || expressed}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      minHeight: 48,
                      cursor: expressed || expressingId === id ? 'default' : 'pointer',
                      backgroundColor: expressed ? 'rgba(16,185,129,0.15)' : 'var(--color-blue)',
                      color: expressed ? 'var(--color-green)' : '#fff',
                      border: expressed ? '1px solid rgba(16,185,129,0.25)' : 'none',
                      boxShadow: expressed ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {expressingId === id ? (
                      <span style={{ display: 'block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                    ) : expressed ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Interest Sent
                      </>
                    ) : (
                      "I'm Interested"
                    )}
                  </button>

                  {expressError ? (
                    <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 12, backgroundColor: 'var(--color-red-soft)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                      {expressError}
                    </div>
                  ) : null}

                  {!access.isAuthenticated && !expressed ? (
                    <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', textAlign: 'center' }}>
                      <a href="/login" style={{ color: 'var(--color-text)', fontWeight: 600 }}>Sign in</a> to express interest.
                    </p>
                  ) : null}

                  {expressed ? (
                    <p style={{ fontSize: 12, color: 'rgba(16,185,129,0.6)', textAlign: 'center' }}>
                      The job poster will review your interest and reach out if selected.
                    </p>
                  ) : null}
                </div>
              )}

              {/* Trust strip */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Fixed price — no negotiation',
                  'Verified contractor network',
                  'Private — no public exposure',
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingAssistant
        route="/jobs/[id]"
        pageTitle="Job Detail"
        pageDescription="Job detail page — full scope visible, interest available, messaging locked pending award"
        pageStateSummary="Full scope visible, interest button available, messaging locked pending award"
        userRole="contractor"
        isLoggedIn={!!access.profile}
      />
    </div>
  )
}

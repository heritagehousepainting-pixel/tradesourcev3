'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavContext } from '@/app/components/NavContext'
import QuickAvailabilityModal from '@/components/QuickAvailabilityModal'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { ProfileSection } from '@/components/ProfileSection'
import ReviewJobModal from '@/components/ReviewJobModal'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function StatCard({ value, label, tone }: { value: string | number; label: string; tone?: 'ok' | 'warn' | 'err' | 'accent' }) {
  return (
    <div className="ts-stat">
      <div className="ts-stat-label">{label}</div>
      <div className={`ts-stat-value${tone ? ' ts-stat-value--' + tone : ''}`}>{value}</div>
    </div>
  )
}

function JobCard({ job, onExpress, expressingId, expressed }: {
  job: any
  onExpress: (id: string) => void
  expressingId: string | null
  expressed: boolean
}) {
  return (
    <div className="ts-panel ts-panel--hover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.005em' }}>{job.title}</h3>
            <span className="ts-chip ts-chip--ok">Open</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'rgba(248,250,252,0.5)' }}>
            {job.area && <span>{job.area}</span>}
            {job.scope && <><span className="ts-dot" style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/><span>{job.scope}</span></>}
            {job.created_at && <><span className="ts-dot" style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/><span>{timeAgo(job.created_at)}</span></>}
          </div>
        </div>
        {job.budget_min && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#34D399', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>${job.budget_min.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'rgba(248,250,252,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fixed price</div>
          </div>
        )}
      </div>
      {job.description && (
        <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.65)', lineHeight: 1.65, marginBottom: 16 }}>{job.description.length > 160 ? job.description.slice(0, 160) + '…' : job.description}</p>
      )}
      <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a href={`/jobs/${job.id}`} className="ts-action ts-action--ghost ts-action--sm" style={{ flex: 1 }}>View details</a>
        <button onClick={() => onExpress(job.id)} disabled={expressingId === job.id || expressed}
          className={expressed ? 'ts-action ts-action--sm' : 'ts-action ts-action--blue ts-action--sm'}
          style={{ flex: 1, ...(expressed ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' } : {}) }}>
          {expressed ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              Interest sent
            </>
          ) : expressingId === job.id ? (
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
          ) : (<>I&apos;m interested <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></>)}
        </button>
      </div>
    </div>
  )
}

function PostedJobCard({ job, interests, onAward, awardingId }: { job: any; interests: any[]; onAward: (jobId: string, contractorId: string, name: string) => void; awardingId: string | null }) {
  const awardedInterest = interests.find((i: any) => i.awarded)
  return (
    <div className="ts-panel" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.005em' }}>{job.title}</h3>
            <span className={`ts-chip ${job.status === 'open' ? 'ts-chip--ok' : job.status === 'awarded' ? 'ts-chip--info' : 'ts-chip--neutral'}`}>
              {job.status === 'open' ? 'Open' : job.status === 'awarded' ? 'Awarded' : job.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'rgba(248,250,252,0.55)' }}>
            {job.area && <span>{job.area}</span>}
            {job.budget_min && <><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/><span style={{ color: '#34D399', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${job.budget_min.toLocaleString()}</span></>}
            {job.scope && <><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/><span>{job.scope}</span></>}
          </div>
          {awardedInterest && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: '#93C5FD' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              Awarded to {awardedInterest.contractors?.name || awardedInterest.contractors?.company || 'contractor'}
            </div>
          )}
        </div>
        <a href={`/jobs/${job.id}`} className="ts-action ts-action--ghost ts-action--sm">View</a>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="ts-section-eyebrow">Interested contractors</span>
          {interests.length > 0 && <span className="ts-section-count">{interests.length}</span>}
        </div>
        {job.status !== 'open' ? (
          <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.45)' }}>{awardedInterest ? 'Job has been awarded.' : `Status: ${job.status}`}</p>
        ) : interests.length === 0 ? (
          <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.45)' }}>No contractors have expressed interest yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interests.map((interest: any) => (
              <div key={interest.id} className="ts-row" style={{ padding: '12px 14px' }}>
                <div className="ts-row-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                  {(interest.contractors?.name || interest.contractors?.company || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="ts-row-main">
                  <div className="ts-row-title">{interest.contractors?.name || interest.contractors?.company || 'Contractor'}</div>
                  <div className="ts-row-meta" style={{ gap: 6 }}>
                    {interest.contractors?.verified_license && <span className="ts-chip ts-chip--ok ts-chip--plain">License</span>}
                    {interest.contractors?.verified_insurance && <span className="ts-chip ts-chip--ok ts-chip--plain">Insurance</span>}
                    {interest.contractors?.reviews_avg_rating && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#FBBF24', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        ★ {interest.contractors.reviews_avg_rating}/5
                        {interest.contractors?.reviews_count > 0 && (
                          <span style={{ fontSize: 10, color: 'rgba(248,250,252,0.4)', fontWeight: 500 }}>({interest.contractors.reviews_count})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ts-row-actions">
                  {interest.awarded ? (
                    <span className="ts-chip ts-chip--ok">Awarded</span>
                  ) : (
                    <button onClick={() => onAward(job.id, interest.contractor_id, interest.contractors?.name || interest.contractors?.company || 'this contractor')}
                      disabled={awardingId === job.id}
                      className="ts-action ts-action--blue ts-action--sm">
                      {awardingId === job.id ? 'Awarding…' : 'Award job'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { access } = useNavContext()
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expressingId, setExpressingId] = useState<string | null>(null)
  const [expressedJobs, setExpressedJobs] = useState<Set<string>>(new Set())
  const [dashboardError, setDashboardError] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [view, setView] = useState<'browse' | 'posted' | 'messages' | 'profile'>('browse')
  const [messageThreads, setMessageThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<any>(null)
  const [threadMessages, setThreadMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showQuickAvailModal, setShowQuickAvailModal] = useState(false)
  const [postedJobInterests, setPostedJobInterests] = useState<Record<string, any[]>>({})
  const [awardingJob, setAwardingJob] = useState<string | null>(null)
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [myRating, setMyRating] = useState<number | null>(null)
  const [reviewForm, setReviewForm] = useState<Record<string, { rating: number; comment: string }>>({})
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null)
  const [reviewSubmitted, setReviewSubmitted] = useState<Set<string>>(new Set())
  const [jobToReview, setJobToReview] = useState<any>(null) // job being marked complete with optional review
  // First-job welcome banner — persisted in localStorage so it only shows once per device
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  useEffect(() => {
    const dismissed = localStorage.getItem('ts_firstjob_dismissed')
    if (!dismissed) setShowWelcomeBanner(true)
  }, [])
  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false)
    try { localStorage.setItem('ts_firstjob_dismissed', 'true') } catch {}
  }

  // Poster-side post-award dismissal
  const dismissPosterAwardCard = () => {
    try { localStorage.setItem('ts_poster_awarded_dismissed', newlyAwardedToPoster?.id ?? '1') } catch {}
    setView('posted')
  }

  const isPendingVetting = access.vettingStatus === 'pending'
  const isApproved = access.vettingStatus === 'approved'

  const myPostedJobs = jobs.filter(j => j.poster_id === user?.id)
  const availableJobs = jobs.filter(j => j.status === 'open' && j.contractor_id !== user?.id && !(j.homeowner_email && j.homeowner_email === user?.email) && j.poster_id !== user?.id)
  const jobsInProgress = jobs.filter(j => j.contractor_id === user?.id && (j.status === 'in_progress' || j.status === 'awarded'))
  // Completed jobs where this user was the awarded contractor — eligible for review
  const completedJobsWithReview = jobs.filter(j => j.contractor_id === user?.id && j.status === 'completed')
  // Newly awarded job — contractor side (they were awarded a job)
  const newlyAwardedJob = jobsInProgress.find(j => j.status === 'awarded')
  const awardedThread = newlyAwardedJob
    ? messageThreads.find(t => t.job_id === newlyAwardedJob.id)
    : null

  // Newly awarded job — poster side (they awarded a job to a contractor)
  const myAwardedJobs = jobs.filter(j => j.poster_id === user?.id && j.status === 'awarded')
  const newlyAwardedToPoster = myAwardedJobs[0] ?? null
  const posterAwardedThread = newlyAwardedToPoster
    ? messageThreads.find(t => t.job_id === newlyAwardedToPoster.id)
    : null
  // contractor_name lives on the job object from the API join
  const awardedToContractor = newlyAwardedToPoster?.contractor_name ?? null

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000)
  }

  useEffect(() => { return () => { if (toastTimer.current) clearTimeout(toastTimer.current) } }, [])

  // Canonical data loading using access.profile.id.
  // The useNavContext provider already handles Supabase session → profile fetch.
  useEffect(() => {
    if (!access.checked) return
    const contractorId = access.profile?.id ?? null
    const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
      profileId ? fetch(`/api/reviews?contractor_id=${profileId}`).then(r => r.json()) : Promise.resolve([]),
      profileId ? fetch(`/api/messages/threads?contractor_id=${profileId}`).then(r => r.json()) : Promise.resolve([]),
    ]).then(([users, jobsData, reviewsData, threadsData]) => {
      if (access.profile) {
        setUser(access.profile)
      } else if (contractorId) {
        const found = users.find((u: any) => String(u.id) === String(contractorId))
        if (found) setUser(found)
      } else if (access.email && !user) {
        const byEmail = users.find((u: any) =>
          u.email?.toLowerCase() === access.email?.toLowerCase()
        )
        if (byEmail) setUser(byEmail)
      }
      setJobs(jobsData || [])
      setMessageThreads(threadsData || [])
      if (reviewsData?.reviews) {
        setMyReviews(reviewsData.reviews)
        const r = reviewsData.reviews
        if (r.length > 0) setMyRating(Math.round((r.reduce((s: number, x: any) => s + x.rating, 0) / r.length * 10) / 10))
      }
      // Show welcome banner once: approved contractor + no job history yet.
      // The localStorage effect above handles the persisted dismiss — no override needed here.
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [access.checked, access.profile])

  useEffect(() => {
    if (!user?.id || myPostedJobs.length === 0) return
    Promise.all(myPostedJobs.map(async (job) => {
      const res = await fetch(`/api/jobs/${job.id}/interests`).catch(() => null)
      return res?.ok ? res.json() : []
    })).then(results => {
      const map: Record<string, any[]> = {}
      myPostedJobs.forEach((j, i) => { map[j.id] = results[i] || [] })
      setPostedJobInterests(map)
    })
  }, [user?.id, myPostedJobs.length])

  const handleExpressInterest = async (jobId: string) => {
    setExpressingId(jobId)
    setDashboardError('')
    try {
      // contractor_id must be the contractor_applications.id (profile ID), not the auth UID.
      const contractorProfileId = access.profile?.id ?? (access as any).contractorProfileId ?? null
      const res = await fetch(`/api/jobs/${jobId}/interest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contractor_id: contractorProfileId }) })
      if (res.ok) { setExpressedJobs(prev => new Set([...prev, jobId])); showToast('Interest sent! The job poster will review your profile.') }
      else setDashboardError('Failed to express interest.')
    } catch { setDashboardError('Failed to express interest.') } finally { setExpressingId(null) }
  }

  const handleOpenThread = async (thread: any) => {
    setActiveThread(thread)
    // Thread stores contractor_applications.id — use the canonical profile ID
    const profileId = access.profile?.id ?? (access as any).contractorProfileId ?? null
    const url = `/api/messages?thread_id=${thread.id}${profileId ? `&contractor_id=${profileId}` : ''}`
    const msgs = await fetch(url).then(r => r.json())
    setThreadMessages(msgs || [])
  }

  const handleSendMessage = async (threadId: string) => {
    if (!newMessage.trim() || !user) return
    setSendingMessage(true)
    const profileId = access.profile?.id ?? (access as any).contractorProfileId ?? null
    try {
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thread_id: threadId, sender_email: user.email, sender_name: user.name || user.full_name || user.company || 'Contractor', content: newMessage, contractor_id: profileId }) })
      setNewMessage('')
      const msgs = await fetch(`/api/messages?thread_id=${threadId}`).then(r => r.json())
      setThreadMessages(msgs || [])
      const threads = await fetch(`/api/messages/threads?contractor_id=${profileId}`).then(r => r.json())
      setMessageThreads(threads || [])
    } catch {} finally { setSendingMessage(false) }
  }

  const handleSubmitReview = async (contractorId: string, jobId: string, posterName: string) => {
    const form = reviewForm[contractorId]
    if (!form || !form.rating) return
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractorId,
          homeowner_name: posterName || user?.name || user?.full_name || 'Contractor',
          rating: form.rating,
          comment: form.comment,
          job_id: jobId,
          reviewer_id: user?.id || null,
          reviewer_type: 'contractor',
        }),
      })
      if (res.ok) {
        setReviewSubmitted(prev => new Set([...prev, jobId]))
        setShowReviewForm(null)
        showToast('Review submitted! Thanks.')
        // Refresh reviews to update rating
        const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
        if (user?.id) {
          fetch(`/api/reviews?contractor_id=${user.id}`).then(r => r.json()).then(data => {
            if (data?.reviews) {
              setMyReviews(data.reviews)
              const r = data.reviews
              if (r.length > 0) setMyRating(Math.round((r.reduce((s: number, x: any) => s + x.rating, 0) / r.length * 10) / 10))
            }
          }).catch(() => null)
        }
      }
    } catch { showToast('Failed to submit review.') }
  }

  // Review-on-complete handlers
  async function handleReviewSubmitOnComplete(rating: number, comment: string) {
    if (!jobToReview || !rating) return
    // Review the poster (other contractor), not ourselves.
    // jobToReview.poster_id is the contractor who posted the job.
    const subjectId = jobToReview.poster_id
    if (!subjectId) { await handleReviewSkip(); return }
    // Reviewer's own display name (the contractor who is submitting this review)
    const reviewerName = user?.name || user?.full_name || user?.company || 'Contractor'
    const subjectName = jobToReview.poster?.name || jobToReview.poster?.company || jobToReview.poster?.full_name || jobToReview.homeowner_name || 'Contractor'
    // Submit review targeting the poster (another contractor)
    await handleSubmitReview(subjectId, jobToReview.id, reviewerName)
    // Then mark the job complete
    const r = await fetch(`/api/jobs/${jobToReview.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    if (r.ok) {
      setJobs(prev => prev.map(j => j.id === jobToReview.id ? { ...j, status: 'completed' } : j))
      showToast('Job completed! Review submitted — thanks.')
      // Refresh rating immediately so the header badge and widget update without page reload
      const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
      if (profileId) {
        fetch(`/api/reviews?contractor_id=${profileId}`).then(r => r.json()).then(data => {
          if (data?.reviews) {
            setMyReviews(data.reviews)
            const revs = data.reviews
            if (revs.length > 0) {
              setMyRating(Math.round((revs.reduce((s: number, x: any) => s + x.rating, 0) / revs.length) * 10) / 10)
            }
          }
        }).catch(() => null)
      }
    }
    setJobToReview(null)
  }

  async function handleReviewSkip() {
    if (!jobToReview) return
    const r = await fetch(`/api/jobs/${jobToReview.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    if (r.ok) {
      setJobs(prev => prev.map(j => j.id === jobToReview.id ? { ...j, status: 'completed' } : j))
      showToast('Job marked as complete.')
    }
    setJobToReview(null)
  }

  const handleAwardJob = async (jobId: string, contractorId: string, contractorName: string) => {
    setAwardingJob(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/award`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contractor_id: contractorId }) })
      if (res.ok) {
        const data = await res.json()
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'awarded', contractor_id: contractorId } : j))
        // Refresh threads so the new conversation appears in the Messages tab
        if (user?.id) {
          fetch(`/api/messages/threads?contractor_id=${user.id}`)
            .then(r => r.json())
            .then(threads => { setMessageThreads(threads || []); return threads })
            .then(threads => {
              // Auto-open the newly created thread if one was returned
              if (data?.thread?.id) {
                const newThread = threads?.find((t: any) => t.id === data.thread.id)
                if (newThread) {
                  setActiveThread(newThread)
                  setView('messages')
                }
              }
            })
            .catch(() => null)
        }
        fetch(`/api/jobs/${jobId}/interests`).then(ir => { if (ir?.ok) ir.json().then(d => setPostedJobInterests(prev => ({ ...prev, [jobId]: d || [] }))) }).catch(() => null)
        showToast(data?.thread?.id ? `Job awarded to ${contractorName}! You can now message them.` : `Job awarded to ${contractorName}!`)
      } else { res.json().then(d => setDashboardError(d?.error || 'Failed to award job.')).catch(() => setDashboardError('Failed to award job.')) }
    } catch { setDashboardError('Failed to award job.') } finally { setAwardingJob(null) }
  }

  // Auth gate — canonical access.canAccessContractorApp covers all contractor states.
  if (!access.canAccessContractorApp) {
    return (
      <div className="ts-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <div style={{ maxWidth: 440, width: '100%' }}>
          <div className="ts-page-kicker">Contractor access</div>
          <h1 className="ts-page-title" style={{ marginBottom: 14 }}>Sign in to <em>your dashboard</em>.</h1>
          <p className="ts-page-sub" style={{ marginBottom: 28 }}>Review open work, track your posted jobs, message contractors, and manage your profile.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/signin" className="ts-action ts-action--primary ts-action--lg">Sign in</a>
            <a href="/apply" className="ts-action ts-action--ghost ts-action--lg">Apply to join</a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ts-app">
        <div className="ts-app-shell">
          <div className="ts-stat-row" style={{ marginBottom: 32 }}>
            {[1,2,3,4].map(i => <div key={i} className="ts-stat" style={{ height: 84, animation: 'pulse 2s ease-in-out infinite' }} />)}
          </div>
          {[1,2,3].map(i => <div key={i} className="ts-panel" style={{ height: 120, marginBottom: 14, animation: 'pulse 2s ease-in-out infinite' }} />)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="ts-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <div style={{ maxWidth: 440, width: '100%' }}>
          <div className="ts-page-kicker">Session required</div>
          <h1 className="ts-page-title" style={{ marginBottom: 14 }}>Sign in to <em>continue</em>.</h1>
          <p className="ts-page-sub" style={{ marginBottom: 28 }}>View your jobs, manage contractors, and track your work.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/login" className="ts-action ts-action--primary ts-action--lg">Sign in</a>
            <a href="/apply" className="ts-action ts-action--ghost ts-action--lg">Apply to join</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ts-app">
      {toastVisible && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 99, padding: '12px 18px', borderRadius: 12, background: 'rgba(10,19,35,0.95)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 14px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {toastMsg}
        </div>
      )}

      {/* Centered hero (homepage-matched scale, CTA below) */}
      <div className="ts-app-hero">
        <div className="ts-app-hero-kicker">Your workspace</div>
        <h1 className="ts-app-hero-title">
          Welcome back, <em>{(user.name || user.full_name || user.company || 'Contractor').split(' ')[0]}</em>.
        </h1>
        <p className="ts-app-hero-sub">
          Browse open work, manage what you’ve posted, and keep conversations moving.
        </p>
        <div className="ts-app-hero-cta">
          <a href="/post-job" className="ts-action ts-action--primary ts-action--lg">
            Post a job
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="/jobs" className="ts-action ts-action--ghost">Browse all jobs</a>
        </div>
        <div className="ts-app-hero-meta">
          <span><b>{availableJobs.length}</b> open</span>
          <span className="sep" />
          <span><b>{jobsInProgress.length}</b> in progress</span>
          <span className="sep" />
          <span><b>{myPostedJobs.length}</b> posted</span>
          {myRating && <><span className="sep" /><span><b>★ {myRating.toFixed(1)}</b> rating</span></>}
        </div>
      </div>

      {/* ── Awarded-job guidance card — contractor side ── */}
      {newlyAwardedJob && (
        <div className="ts-app-shell" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 24 }}>
          <div className="ts-feature">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div className="ts-page-kicker" style={{ marginBottom: 8 }}>Job awarded · you</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 4, lineHeight: 1.15 }}>
                  {newlyAwardedJob.title}
                </h2>
                {newlyAwardedJob.area && (
                  <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.55)' }}>{newlyAwardedJob.area}</p>
                )}
              </div>
              {newlyAwardedJob.budget_min && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#34D399', letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    ${newlyAwardedJob.budget_min.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(248,250,252,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fixed rate</div>
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(10,19,35,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
              <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Your next steps</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { num: 1, label: 'Confirm the job',
                    detail: awardedThread ? 'Message the poster to confirm timeline and details.' : 'The poster will reach out shortly.',
                    action: awardedThread ? { label: 'Message now', onClick: () => { setActiveThread(awardedThread); setView('messages') } } : null },
                  { num: 2, label: 'Start work',
                    detail: 'Once confirmed, update the job status to In Progress.',
                    action: { label: 'Mark started', onClick: async () => {
                      const r = await fetch(`/api/jobs/${newlyAwardedJob.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in_progress' }) })
                      if (r.ok) { setJobs(prev => prev.map(j => j.id === newlyAwardedJob.id ? { ...j, status: 'in_progress' } : j)); showToast('Job marked as in progress!') }
                    } } },
                  { num: 3, label: 'Complete and get rated',
                    detail: 'Mark done when finished. Both parties can leave reviews.',
                    action: null },
                ].map(step => (
                  <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(96,165,250,0.14)', border: '1px solid rgba(96,165,250,0.3)', color: '#93C5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{step.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)' }}>{step.detail}</div>
                    </div>
                    {step.action && (
                      <button onClick={step.action.onClick as any} className="ts-action ts-action--blue ts-action--sm">
                        {step.action.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="ts-action ts-action--ghost ts-action--sm"
                onClick={async () => {
                  const r = await fetch(`/api/jobs/${newlyAwardedJob.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in_progress' }) })
                  if (r.ok) { setJobs(prev => prev.map(j => j.id === newlyAwardedJob.id ? { ...j, status: 'in_progress' } : j)); showToast('Job marked as in progress!') }
                }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Poster-side post-award guidance — shown when poster has awarded a job ── */}
      {(() => {
        if (!newlyAwardedToPoster) return null
        // Persist dismissal — if this job has been dismissed, don't show again
        try {
          const lastDismissed = localStorage.getItem('ts_poster_awarded_dismissed')
          if (lastDismissed === newlyAwardedToPoster.id) return null
        } catch {}
        if (view === 'posted') return null
        return (
        <div className="ts-app-shell" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 24 }}>
          <div className="ts-feature ts-feature--warn">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div className="ts-page-kicker" style={{ color: '#FBBF24', marginBottom: 8 }}>Job awarded · poster</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 4, lineHeight: 1.15 }}>
                  {newlyAwardedToPoster.title}
                </h2>
                {newlyAwardedToPoster.area && (
                  <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.55)' }}>{newlyAwardedToPoster.area}</p>
                )}
                {awardedToContractor && (
                  <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', marginTop: 4 }}>
                    Awarded to <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{awardedToContractor}</strong>
                  </p>
                )}
              </div>
              {newlyAwardedToPoster.budget_min && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#34D399', letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    ${newlyAwardedToPoster.budget_min.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(248,250,252,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fixed rate</div>
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(10,19,35,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
              <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>Your next steps as poster</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { num: 1, label: 'Confirm the details',
                    detail: posterAwardedThread ? 'Message the contractor to confirm timeline, start date, and scope.' : 'The contractor will reach out to confirm timeline and scheduling.',
                    action: posterAwardedThread ? { label: 'Message now', onClick: () => { setActiveThread(posterAwardedThread); setView('messages') } } : null },
                  { num: 2, label: 'Track the job',
                    detail: 'Update the job status to In Progress once work begins. Keep an eye on messages.',
                    action: null },
                  { num: 3, label: 'Leave a review',
                    detail: 'After completion, both parties can leave reviews. Your review builds network trust.',
                    action: null },
                ].map(step => (
                  <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(251,191,36,0.14)', border: '1px solid rgba(251,191,36,0.3)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{step.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)' }}>{step.detail}</div>
                    </div>
                    {step.action && (
                      <button onClick={step.action.onClick as any}
                        className="ts-action ts-action--sm"
                        style={{ background: '#FBBF24', color: '#06101F', boxShadow: '0 6px 20px rgba(251,191,36,0.3)' }}>
                        {step.action.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={dismissPosterAwardCard} className="ts-action ts-action--ghost ts-action--sm">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )})()}

      {/* ── First-job guidance card — shown to newly approved contractors with no history ── */}
      {!newlyAwardedJob && isApproved && myPostedJobs.length === 0 && jobsInProgress.length === 0 && showWelcomeBanner && (
        <div className="ts-app-shell" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 24 }}>
          <div className="ts-feature ts-feature--ok" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="ts-page-kicker" style={{ color: '#34D399', marginBottom: 10 }}>Welcome to TradeSource</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.15 }}>
                Post your first <em style={{ fontStyle: 'normal', color: '#93C5FD', fontWeight: 700 }}>overflow job</em>.
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.6)', lineHeight: 1.65, marginBottom: 16, maxWidth: 520 }}>
                Other contractors start expressing interest the moment your job goes live. The faster you post, the sooner you connect.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/post-job" className="ts-action ts-action--primary">
                  Post your first job
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
                <a href="/jobs" className="ts-action ts-action--ghost">Browse jobs first</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 28, flexShrink: 0 }}>
              {[
                { n: availableJobs.length, label: 'Open jobs', tone: 'ok' },
                { n: 4, label: 'Counties live', tone: 'accent' },
                { n: '5', label: 'Vetting checks', tone: 'accent' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div className={`ts-stat-value ts-stat-value--${stat.tone}`} style={{ fontSize: 30 }}>{stat.n}</div>
                  <div className="ts-stat-label" style={{ marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <button onClick={dismissWelcomeBanner} className="ts-action ts-action--ghost ts-action--sm" style={{ alignSelf: 'flex-start' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Onboarding mini banners ── */}
      {(() => {
        const hasPending = access.vettingStatus === 'pending'
        const hasCompany = !!(user?.company || user?.business_name)
        if (hasPending) return (
          <div className="ts-app-shell" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 24 }}>
            <div className="ts-panel" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px', borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ flex: 1, fontSize: 13, color: 'rgba(248,250,252,0.75)', lineHeight: 1.5, margin: 0 }}>
                <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Application in review</strong> — our team is reviewing your application personally. You will hear from us within 1–2 business days.
              </p>
            </div>
          </div>
        )
        if (!newlyAwardedJob && !isApproved && myPostedJobs.length === 0 && jobsInProgress.length === 0 && !hasCompany && showWelcomeBanner) return (
          <div className="ts-app-shell" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 24 }}>
            <div className="ts-panel" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px', borderColor: 'rgba(96,165,250,0.22)', background: 'rgba(96,165,250,0.06)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ flex: 1, fontSize: 13, color: 'rgba(248,250,252,0.75)', lineHeight: 1.5, margin: 0 }}>
                <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Complete your profile</strong> to show contractors your business details and get rated.
              </p>
              <button onClick={() => setView('profile')} className="ts-action ts-action--blue ts-action--sm">
                Complete profile
              </button>
            </div>
          </div>
        )
        return null
      })()}

      {/* Tab nav */}
      <div style={{ position: 'sticky', top: 64, zIndex: 20, background: 'rgba(10,19,35,0.72)', backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '14px 28px' }}>
          <div className="ts-segtabs">
            {[
              { key: 'browse', label: 'Browse jobs' },
              { key: 'posted', label: 'My posted jobs' },
              { key: 'messages', label: 'Messages' },
              { key: 'profile', label: 'Profile' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key as typeof view)}
                className={`ts-segtab ${view === tab.key ? 'is-active' : ''}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ts-app-shell" style={{ paddingTop: 32 }}>

        {/* BROWSE */}
        {view === 'browse' && (
          <div>
            {dashboardError && <div className="ts-chip ts-chip--err" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 20 }}>{dashboardError}</div>}

            {/* Active Work */}
            {jobsInProgress.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="ts-section-head-row" style={{ margin: '0 0 16px' }}>
                  <span className="ts-section-eyebrow">Active work</span>
                  <span className="ts-section-count">{jobsInProgress.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobsInProgress.map((job: any) => (
                    <div key={job.id} className="ts-panel" style={{ padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.005em' }}>{job.title}</h3>
                            <span className={`ts-chip ${job.status === 'in_progress' ? 'ts-chip--info' : 'ts-chip--ok'}`}>
                              {job.status === 'in_progress' ? 'In progress' : 'Awarded'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'rgba(248,250,252,0.55)' }}>
                            {job.area && <span>{job.area}</span>}
                            {job.budget_min && <><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/><span style={{ color: '#34D399', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${job.budget_min.toLocaleString()}</span></>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                          {job.status === 'awarded' && (
                            <button className="ts-action ts-action--blue ts-action--sm"
                              onClick={async () => { const r = await fetch(`/api/jobs/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in_progress' }) }); if (r.ok) { setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in_progress' } : j)); showToast('Job started!') } }}>
                              Confirm &amp; start
                            </button>
                          )}
                          {job.status === 'in_progress' && (
                            <button onClick={() => setJobToReview(job)} className="ts-action ts-action--success ts-action--sm">
                              Mark done
                            </button>
                          )}
                          <a href={`/jobs/${job.id}`} className="ts-action ts-action--ghost ts-action--sm">Details</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Work — jobs this contractor was awarded and completed */}
            {completedJobsWithReview.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="ts-section-head-row" style={{ margin: '0 0 16px' }}>
                  <span className="ts-section-eyebrow">Completed work</span>
                  <span className="ts-section-count">{completedJobsWithReview.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {completedJobsWithReview.map((job: any) => {
                    const subjectName = job.poster?.name || job.poster?.company || job.poster?.full_name || 'the homeowner'
                    const reviewerName = user?.name || user?.full_name || user?.company || 'Contractor'
                    const alreadyReviewed = reviewSubmitted.has(job.id)
                    const showForm = showReviewForm === job.id
                    return (
                      <div key={job.id} className="ts-panel" style={{ padding: '18px 22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: alreadyReviewed || showForm ? 0 : 12, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.005em' }}>{job.title}</h3>
                              <span className="ts-chip ts-chip--ok">Completed</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'rgba(248,250,252,0.55)' }}>
                              {job.area && <span>{job.area}</span>}
                              {job.budget_min && <><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/><span style={{ color: '#34D399', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${job.budget_min.toLocaleString()}</span></>}
                            </div>
                          </div>
                          {!alreadyReviewed && !showForm && (
                            <button onClick={() => setShowReviewForm(job.id)} className="ts-action ts-action--sm"
                              style={{ background: '#FBBF24', color: '#06101F', boxShadow: '0 6px 20px rgba(251,191,36,0.3)' }}>
                              Leave review
                            </button>
                          )}
                          {alreadyReviewed && (
                            <span className="ts-chip ts-chip--ok" style={{ padding: '6px 12px' }}>Review submitted</span>
                          )}
                        </div>
                        {showForm && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.6)', marginBottom: 12 }}>
                              How was working with <strong style={{ color: 'var(--color-text)' }}>{subjectName}</strong> on <strong style={{ color: 'var(--color-text)' }}>{job.title}</strong>?
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                              {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...(prev[job.contractor_id] || {}), rating: star, comment: prev[job.contractor_id]?.comment || '' } }))}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, lineHeight: 1, padding: '0 3px', color: (reviewForm[job.poster_id]?.rating || 0) >= star ? '#FBBF24' : 'rgba(255,255,255,0.14)' }}>★</button>
                              ))}
                              {(reviewForm[job.poster_id]?.rating || 0) > 0 && (
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', marginLeft: 6 }}>{(reviewForm[job.poster_id]?.rating || 0)}/5</span>
                              )}
                            </div>
                            <textarea className="ts-textarea" rows={3}
                              value={reviewForm[job.poster_id]?.comment || ''}
                              onChange={e => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...(prev[job.contractor_id] || {}), comment: e.target.value } }))}
                              placeholder="Share your experience (optional)…" />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button onClick={() => handleSubmitReview(job.poster_id, job.id, reviewerName)} disabled={!reviewForm[job.poster_id]?.rating}
                                className="ts-action ts-action--sm"
                                style={{ background: reviewForm[job.poster_id]?.rating ? '#FBBF24' : 'rgba(255,255,255,0.08)', color: reviewForm[job.poster_id]?.rating ? '#06101F' : 'rgba(248,250,252,0.4)' }}>
                                Submit review
                              </button>
                              <button onClick={() => setShowReviewForm(null)} className="ts-action ts-action--ghost ts-action--sm">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Open Jobs — single framed window, borderless rows (homepage parity) */}
            <div>
              <div className="ts-section-head-row" style={{ margin: '0 0 18px' }}>
                <span className="ts-section-eyebrow">Open jobs</span>
                <span className="ts-section-count">{availableJobs.length}</span>
              </div>
              {availableJobs.length === 0 ? (
                <div className="ts-empty">
                  <div className="ts-empty-title">No open jobs in your area right now</div>
                  <div className="ts-empty-sub">Jobs are posted by network contractors as overflow work comes in. New work goes up regularly.</div>
                  <div className="ts-empty-cta"><a href="/jobs" className="ts-action ts-action--blue">Browse all jobs</a></div>
                </div>
              ) : (
                <div className="ts-mk-halo ts-mk-halo--blue">
                  <div className="ts-joblist-frame">
                    <div className="mk-chrome">
                      <div className="mk-dots"><span/><span/><span/></div>
                      <div className="mk-chrome-title">TradeSource · Open jobs</div>
                    </div>
                    <div className="ts-joblist-rows">
                      {availableJobs.slice(0, 8).map((job: any) => (
                        <a key={job.id} href={`/jobs/${job.id}`} className="ts-joblist-row">
                          <div className="ts-joblist-main">
                            <div className="ts-joblist-title">
                              {job.title}
                              {expressedJobs.has(job.id) && <span className="ts-chip ts-chip--ok ts-chip--plain">Interest sent</span>}
                            </div>
                            <div className="ts-joblist-meta">
                              {job.area && <span>{job.area}</span>}
                              {job.scope && <><span className="sep" /><span>{job.scope}</span></>}
                              {job.created_at && <><span className="sep" /><span>{timeAgo(job.created_at)}</span></>}
                            </div>
                          </div>
                          {job.budget_min && <div className="ts-joblist-price">${job.budget_min.toLocaleString()}</div>}
                          <svg className="ts-joblist-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                        </a>
                      ))}
                    </div>
                    {availableJobs.length > 8 && (
                      <a href="/jobs" style={{ display: 'block', textAlign: 'center', padding: '14px 18px', fontSize: 13, fontWeight: 600, color: '#93C5FD', textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        View all {availableJobs.length} open jobs →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* POSTED JOBS */}
        {view === 'posted' && (
          <div>
            {/* Poster-side review prompt */}
            {(myPostedJobs.some((j: any) => j.status === 'completed' && j.contractor_id)) && (
              <div className="ts-feature ts-feature--warn" style={{ padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>Rate your completed contractor work</div>
                    <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.55)' }}>
                      Your review helps the whole network find trustworthy contractors.
                    </div>
                  </div>
                </div>
                <a href="/reviews" className="ts-action ts-action--sm"
                  style={{ background: '#FBBF24', color: '#06101F', boxShadow: '0 6px 20px rgba(251,191,36,0.3)' }}>
                  Leave a review
                </a>
              </div>
            )}

            <div className="ts-page-head-row" style={{ marginBottom: 24 }}>
              <div>
                <div className="ts-section-eyebrow" style={{ marginBottom: 6 }}>My posted jobs</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: 4 }}>
                  Manage work you’ve posted
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.55)' }}>Review contractors who expressed interest and award the job.</p>
              </div>
              <a href="/post-job" className="ts-action ts-action--primary">
                Post new job
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>

            {myPostedJobs.length === 0 ? (
              <div className="ts-empty">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div className="ts-empty-title">No jobs posted yet</div>
                <div className="ts-empty-sub">Post your overflow work so other vetted contractors can express interest.</div>
                <div className="ts-empty-cta"><a href="/post-job" className="ts-action ts-action--primary ts-action--lg">Post your first job</a></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myPostedJobs.map(job => (
                  <PostedJobCard key={job.id} job={job} interests={postedJobInterests[job.id] || []} onAward={handleAwardJob} awardingId={awardingJob} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {view === 'messages' && (
          <div className="dashboard-messages-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(0, 1.8fr)', gap: 16, minHeight: 520 }}>
            <div className="ts-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
              <div className="ts-section-head-row" style={{ margin: '0 0 14px' }}>
                <span className="ts-section-eyebrow">Conversations</span>
                {messageThreads.length > 0 && <span className="ts-section-count">{messageThreads.length}</span>}
              </div>
              {messageThreads.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 8px' }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(248,250,252,0.35)" strokeWidth={1.5} style={{ marginBottom: 14 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>No conversations yet</p>
                  <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.45)', lineHeight: 1.55, maxWidth: 220 }}>Award a contractor on one of your posted jobs to start messaging.</p>
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, margin: '0 -6px' }}>
                  {messageThreads.map(thread => (
                    <button key={thread.id} onClick={() => handleOpenThread(thread)}
                      className={`ts-thread ${activeThread?.id === thread.id ? 'is-active' : ''}`}>
                      <div className="ts-thread-title">{thread.jobs?.title || `Job ${thread.job_id?.slice(0, 8)}`}</div>
                      <div className="ts-thread-preview">{thread.last_message || 'No messages yet'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ts-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
              {!activeThread ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4, letterSpacing: '-0.005em' }}>Select a conversation</p>
                  <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.45)' }}>Choose a thread on the left to view messages.</p>
                </div>
              ) : (
                <>
                  <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3, letterSpacing: '-0.005em' }}>{activeThread.jobs?.title || `Job ${activeThread.job_id?.slice(0, 8)}`}</h3>
                    <p style={{ fontSize: 11, color: 'rgba(248,250,252,0.45)' }}>{activeThread.jobs?.area || 'Location not specified'}</p>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14, minHeight: 0, padding: '4px 2px' }}>
                    {threadMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', paddingTop: 28 }}><p style={{ fontSize: 12, color: 'rgba(248,250,252,0.45)' }}>No messages yet. Say hello.</p></div>
                    ) : threadMessages.map((msg: any) => {
                      const isSelf = msg.sender_email === user.email
                      return (
                        <div key={msg.id} className={`ts-msg ${isSelf ? 'is-self' : ''}`}>
                          <div className="ts-msg-avatar">{(msg.sender_name || msg.sender_email || '?').charAt(0).toUpperCase()}</div>
                          <div className="ts-msg-body">
                            <div className="ts-msg-sender">{msg.sender_name || msg.sender_email}</div>
                            <div className="ts-msg-bubble">{msg.content}</div>
                            <div className="ts-msg-time">{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" className="ts-input" value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !sendingMessage) handleSendMessage(activeThread.id) }}
                      placeholder="Send a message…" disabled={sendingMessage} style={{ flex: 1 }} />
                    <button onClick={() => handleSendMessage(activeThread.id)} disabled={sendingMessage || !newMessage.trim()}
                      className="ts-action ts-action--blue">
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {view === 'profile' && <ProfileSection user={user} onBack={() => setView('browse')} />}

      </div>

      {jobToReview && (
        <ReviewJobModal
          isOpen={true}
          job={jobToReview}
          onSubmit={handleReviewSubmitOnComplete}
          onSkip={handleReviewSkip}
          onClose={() => setJobToReview(null)}
        />
      )}

      <QuickAvailabilityModal isOpen={showQuickAvailModal} onClose={() => setShowQuickAvailModal(false)} onSuccess={() => showToast("Availability posted! The network can now see you're open for work.")} userId={user?.id || null} />
      <FloatingAssistant route="/dashboard" pageTitle="Dashboard" pageDescription="Contractor dashboard — browse jobs, manage posted work, messages" pageStateSummary="Dashboard view — browsing, posted jobs, messages, vetting status" userRole="contractor" isLoggedIn={!!user} />
    </div>
  )
}

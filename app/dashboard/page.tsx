'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavContext } from '@/app/components/NavContext'
import QuickAvailabilityModal from '@/components/QuickAvailabilityModal'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { ProfileSection } from '@/components/ProfileSection'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent || 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6 }}>{label}</div>
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
    <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px var(--color-shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>Open</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {job.area && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</span>}
            {job.scope && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>{job.scope}</span>}
            {job.created_at && <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{timeAgo(job.created_at)}</span>}
          </div>
        </div>
        {job.budget_min && (
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-green)', letterSpacing: '-0.02em' }}>${job.budget_min.toLocaleString()}</div>
          </div>
        )}
      </div>
      {job.description && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 14 }}>{job.description.length > 160 ? job.description.slice(0, 160) + '…' : job.description}</p>
      )}
      <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--color-divider)' }}>
        <a href={`/jobs/${job.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border-strong)', textDecoration: 'none', minHeight: 40 }}>View Details</a>
        <button onClick={() => onExpress(job.id)} disabled={expressingId === job.id || expressed} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, minHeight: 40, cursor: expressed || expressingId === job.id ? 'default' : 'pointer', backgroundColor: expressed ? 'var(--color-green-soft)' : 'var(--color-blue)', color: expressed ? 'var(--color-green)' : '#fff', border: '1px solid transparent', boxShadow: expressed ? 'none' : '0 2px 8px rgba(37,99,235,0.25)' }}>
          {expressed ? '✓ Sent' : expressingId === job.id ? '…' : "I'm Interested"}
        </button>
      </div>
    </div>
  )
}

function PostedJobCard({ job, interests, onAward, awardingId }: { job: any; interests: any[]; onAward: (jobId: string, contractorId: string, name: string) => void; awardingId: string | null }) {
  const awardedInterest = interests.find((i: any) => i.awarded)
  return (
    <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, backgroundColor: job.status === 'open' ? 'var(--color-green-soft)' : 'var(--color-blue-soft)', color: job.status === 'open' ? 'var(--color-green)' : 'var(--color-blue)' }}>
              {job.status === 'open' ? 'Open' : job.status === 'awarded' ? 'Awarded' : job.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {job.area && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</span>}
            {job.budget_min && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-green)' }}>${job.budget_min.toLocaleString()}</span>}
            {job.scope && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>{job.scope}</span>}
          </div>
          {awardedInterest && (
            <p style={{ fontSize: 11, color: 'var(--color-blue)', marginTop: 4 }}>
              ✓ Awarded to {awardedInterest.contractors?.name || awardedInterest.contractors?.company || 'contractor'}
            </p>
          )}
        </div>
        <a href={`/jobs/${job.id}`} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', textDecoration: 'none', flexShrink: 0 }}>View</a>
      </div>
      <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)' }}>Interested Contractors</span>
          {interests.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>{interests.length}</span>}
        </div>
        {job.status !== 'open' ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{awardedInterest ? 'Job has been awarded.' : `Status: ${job.status}`}</p>
        ) : interests.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>No contractors have expressed interest yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interests.map((interest: any) => (
              <div key={interest.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--color-blue)', flexShrink: 0 }}>
                    {(interest.contractors?.name || interest.contractors?.company || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{interest.contractors?.name || interest.contractors?.company || 'Contractor'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                      {interest.contractors?.verified_license && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>License ✓</span>}
                      {interest.contractors?.verified_insurance && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>Insurance ✓</span>}
                      {interest.contractors?.rating && <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>★ {interest.contractors.rating}/5</span>}
                    </div>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {interest.awarded ? (
                    <span style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>✓ Awarded</span>
                  ) : (
                    <button onClick={() => onAward(job.id, interest.contractor_id, interest.contractors?.name || interest.contractors?.company || 'this contractor')} disabled={awardingId === job.id} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', cursor: awardingId === job.id ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                      {awardingId === job.id ? 'Awarding…' : 'Award Job'}
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

  const myPostedJobs = jobs.filter(j => j.poster_id === user?.id)
  const availableJobs = jobs.filter(j => j.status === 'open' && j.contractor_id !== user?.id && !(j.homeowner_email && j.homeowner_email === user?.email) && j.poster_id !== user?.id)
  const jobsInProgress = jobs.filter(j => j.contractor_id === user?.id && (j.status === 'in_progress' || j.status === 'awarded'))
  // Completed jobs where this user was the awarded contractor — eligible for review
  const completedJobsWithReview = jobs.filter(j => j.contractor_id === user?.id && j.status === 'completed')

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
    // contractorProfileId handles cases where access.profile is null but access.contractorProfileId is set
    const profileId = (access as any).contractorProfileId ?? access.profile?.id ?? null
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
      profileId ? fetch(`/api/reviews?contractor_id=${profileId}`).then(r => r.json()) : Promise.resolve([]),
      profileId ? fetch(`/api/messages/threads?contractor_id=${profileId}`).then(r => r.json()) : Promise.resolve([]),
    ]).then(([users, jobsData, reviewsData, threadsData]) => {
      // Set user from canonical access.profile if available
      if (access.profile) {
        setUser(access.profile)
      } else if (contractorId) {
        // Fallback: find by contractorId in fetched users
        const found = users.find((u: any) => String(u.id) === String(contractorId))
        if (found) setUser(found)
      } else if (access.email && !user) {
        // Authenticated but no contractor profile row — verify via email match.
        // This covers edge cases where the profile row exists but auth lookup missed it.
        const byEmail = users.find((u: any) =>
          u.email?.toLowerCase() === access.email?.toLowerCase()
        )
        if (byEmail) setUser(byEmail)
      }
      // Do NOT add a 'last resort: first approved user' fallback — it would
      // display a random contractor's data to the wrong person on auth edge cases.
      setJobs(jobsData || [])
      setMessageThreads(threadsData || [])
      if (reviewsData?.reviews) {
        setMyReviews(reviewsData.reviews)
        const r = reviewsData.reviews
        if (r.length > 0) setMyRating(Math.round((r.reduce((s: number, x: any) => s + x.rating, 0) / r.length * 10) / 10))
      }
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
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to access your dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>View your jobs, manage contractors, and track your work.</p>
          <a href="/founder-login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/apply" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Apply to Join</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 100, borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', animation: 'pulse 2s ease-in-out infinite' }} />)}
          </div>
          {[1,2,3].map(i => <div key={i} style={{ height: 120, borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', marginBottom: 14, animation: 'pulse 2s ease-in-out infinite' }} />)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to access your dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>View your jobs, manage contractors, and track your work.</p>
          <a href="/login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/apply" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Apply to Join</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {toastVisible && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 99, padding: '14px 20px', borderRadius: 12, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', boxShadow: '0 8px 32px var(--color-shadow-lg)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)', padding: '36px 32px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 4 }}>Contractor Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{user.name || user.full_name || user.company || 'Contractor'} · Manage your work</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.2)' }}>✓ Verified</span>
            {myRating && <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>★ {myRating}/5</span>}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 60, zIndex: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', gap: 0, height: 52, alignItems: 'center' }}>
            {[
              { key: 'browse', label: 'Browse Jobs', count: availableJobs.length },
              { key: 'posted', label: 'My Posted Jobs', count: myPostedJobs.length },
              { key: 'messages', label: 'Messages', count: messageThreads.length },
              { key: 'profile', label: 'Profile', count: 0 },
            ].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key as typeof view)} style={{ padding: '0 20px', height: '100%', fontSize: 13, fontWeight: view === tab.key ? 700 : 500, color: view === tab.key ? 'var(--color-blue)' : 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none', borderBottom: view === tab.key ? '2.5px solid var(--color-blue)' : '2.5px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.15s, border-color 0.15s' }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, backgroundColor: view === tab.key ? 'var(--color-blue-soft)' : 'var(--color-surface)', color: view === tab.key ? 'var(--color-blue)' : 'var(--color-text-muted)' }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* BROWSE */}
        {view === 'browse' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
              <StatCard value={availableJobs.length} label="Open Jobs" accent={availableJobs.length > 0 ? 'var(--color-green)' : undefined} />
              <StatCard value={jobsInProgress.length} label="In Progress" accent="var(--color-blue)" />
              <StatCard value={myPostedJobs.length} label="My Posted" accent="var(--color-text)" />
              <StatCard value={myRating ? `${myRating} ★` : '—'} label={myRating ? `${myReviews.length} review${myReviews.length !== 1 ? 's' : ''}` : 'No rating'} accent={myRating ? '#F59E0B' : 'var(--color-text-subtle)'} />
            </div>

            {dashboardError && <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)', marginBottom: 20 }}>{dashboardError}</div>}

            {/* Active Work */}
            {jobsInProgress.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active Work</h2>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>{jobsInProgress.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobsInProgress.map((job: any) => (
                    <div key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 22px', borderLeft: '3px solid var(--color-blue)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{job.title}</h3>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, backgroundColor: job.status === 'in_progress' ? 'var(--color-blue-soft)' : 'var(--color-green-soft)', color: job.status === 'in_progress' ? 'var(--color-blue)' : 'var(--color-green)' }}>{job.status === 'in_progress' ? 'In Progress' : 'Awarded'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            {job.area && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</span>}
                            {job.budget_min && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-green)' }}>${job.budget_min.toLocaleString()}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          {job.status === 'awarded' && (
                            <button onClick={async () => { const r = await fetch(`/api/jobs/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in_progress' }) }); if (r.ok) { setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in_progress' } : j)); showToast('Job started!') } }} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer' }}>Start Work</button>
                          )}
                          {job.status === 'in_progress' && (
                            <button onClick={async () => { const r = await fetch(`/api/jobs/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) }); if (r.ok) { setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed' } : j)); showToast('Job completed!') } }} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}>Mark Done</button>
                          )}
                          <a href={`/jobs/${job.id}`} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>View</a>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Completed Work</h2>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>{completedJobsWithReview.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {completedJobsWithReview.map((job: any) => {
                    const posterName = job.poster?.name || job.poster?.company || job.poster?.full_name || 'the homeowner'
                    const alreadyReviewed = reviewSubmitted.has(job.id)
                    const showForm = showReviewForm === job.id
                    return (
                      <div key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 22px', borderLeft: '3px solid var(--color-green)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: alreadyReviewed || showForm ? 0 : 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{job.title}</h3>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>Completed</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              {job.area && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</span>}
                              {job.budget_min && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-green)' }}>${job.budget_min.toLocaleString()}</span>}
                            </div>
                          </div>
                          {!alreadyReviewed && !showForm && (
                            <button onClick={() => setShowReviewForm(job.id)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: '#F59E0B', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>Leave Review</button>
                          )}
                          {alreadyReviewed && (
                            <span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', flexShrink: 0 }}>✓ Review Submitted</span>
                          )}
                        </div>
                        {showForm && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-divider)' }}>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                              How was working with {posterName} on <strong>{job.title}</strong>?
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...(prev[job.contractor_id] || {}), rating: star, comment: prev[job.contractor_id]?.comment || '' } }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: '0 2px', color: (reviewForm[job.contractor_id]?.rating || 0) >= star ? '#F59E0B' : 'var(--color-border-strong)' }}>★</button>
                              ))}
                              {(reviewForm[job.contractor_id]?.rating || 0) > 0 && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>{(reviewForm[job.contractor_id]?.rating || 0)}/5</span>
                              )}
                            </div>
                            <textarea
                              value={reviewForm[job.contractor_id]?.comment || ''}
                              onChange={e => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...(prev[job.contractor_id] || {}), comment: e.target.value } }))}
                              placeholder="Share your experience (optional)…"
                              rows={3}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--color-input-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: 10 }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleSubmitReview(job.contractor_id, job.id, posterName)} disabled={!reviewForm[job.contractor_id]?.rating} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: reviewForm[job.contractor_id]?.rating ? '#F59E0B' : 'var(--color-border)', color: reviewForm[job.contractor_id]?.rating ? '#fff' : 'var(--color-text-subtle)', border: 'none', cursor: reviewForm[job.contractor_id]?.rating ? 'pointer' : 'not-allowed', opacity: reviewForm[job.contractor_id]?.rating ? 1 : 0.6 }}>Submit Review</button>
                              <button onClick={() => setShowReviewForm(null)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Open Jobs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open Jobs</h2>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>{availableJobs.length}</span>
              </div>
              {availableJobs.length === 0 ? (
                <div style={{ padding: '48px 32px', borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>No open jobs right now</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 20 }}>Check back soon — new jobs are posted regularly.</p>
                  <a href="/jobs" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Browse All Jobs</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {availableJobs.slice(0, 8).map(job => (
                    <JobCard key={job.id} job={job} onExpress={handleExpressInterest} expressingId={expressingId} expressed={expressedJobs.has(job.id)} />
                  ))}
                  {availableJobs.length > 8 && (
                    <a href="/jobs" style={{ display: 'block', textAlign: 'center', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-blue)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                      +{availableJobs.length - 8} more jobs →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* POSTED JOBS */}
        {view === 'posted' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 4 }}>My Posted Jobs</h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage contractors who expressed interest in your work.</p>
              </div>
              <a href="/post-job" style={{ padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Post New Job</a>
            </div>
            {myPostedJobs.length === 0 ? (
              <div style={{ padding: '64px 32px', borderRadius: 14, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>No jobs posted yet</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.65 }}>Post your overflow work so other vetted contractors can express interest.</p>
                <a href="/post-job" style={{ display: 'inline-block', padding: '11px 22px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Post Your First Job</a>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 16, minHeight: 480 }}>
            <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Conversations</h2>
                {messageThreads.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>{messageThreads.length}</span>}
              </div>
              {messageThreads.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>No conversations</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', lineHeight: 1.55 }}>Award a contractor on one of your posted jobs to start messaging.</p>
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {messageThreads.map(thread => (
                    <button key={thread.id} onClick={() => handleOpenThread(thread)} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', backgroundColor: activeThread?.id === thread.id ? 'var(--color-blue-soft)' : 'var(--color-surface)', border: activeThread?.id === thread.id ? '1px solid rgba(37,99,235,0.2)' : '1px solid var(--color-border)', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.jobs?.title || `Job ${thread.job_id?.slice(0, 8)}`}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.last_message || 'No messages yet'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
              {!activeThread ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Select a conversation</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Choose a thread to view messages.</p>
                </div>
              ) : (
                <>
                  <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--color-divider)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{activeThread.jobs?.title || `Job ${activeThread.job_id?.slice(0, 8)}`}</h3>
                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{activeThread.jobs?.area || 'Location not specified'}</p>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 0 }}>
                    {threadMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', paddingTop: 24 }}><p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>No messages yet. Say hello!</p></div>
                    ) : threadMessages.map((msg: any) => (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: msg.sender_email === user.email ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: msg.sender_email === user.email ? 'var(--color-blue)' : 'var(--color-surface)', border: msg.sender_email === user.email ? 'none' : '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: msg.sender_email === user.email ? '#fff' : 'var(--color-text-muted)', flexShrink: 0 }}>
                          {(msg.sender_name || msg.sender_email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ maxWidth: '72%' }}>
                          <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginBottom: 4, textAlign: msg.sender_email === user.email ? 'right' : 'left', paddingLeft: msg.sender_email === user.email ? 0 : 32 }}>{msg.sender_name || msg.sender_email}</div>
                          <div style={{ padding: '9px 14px', borderRadius: 12, backgroundColor: msg.sender_email === user.email ? 'var(--color-blue)' : 'var(--color-surface)', color: msg.sender_email === user.email ? '#fff' : 'var(--color-text)', border: msg.sender_email === user.email ? 'none' : '1px solid var(--color-border)', fontSize: 13, lineHeight: 1.5, borderBottomLeftRadius: msg.sender_email === user.email ? 12 : 4, borderBottomRightRadius: msg.sender_email === user.email ? 4 : 12 }}>{msg.content}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 3, textAlign: msg.sender_email === user.email ? 'right' : 'left', paddingLeft: msg.sender_email === user.email ? 0 : 32 }}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !sendingMessage) handleSendMessage(activeThread.id) }} placeholder="Type a message…" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--color-input-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} disabled={sendingMessage} />
                    <button onClick={() => handleSendMessage(activeThread.id)} disabled={sendingMessage || !newMessage.trim()} style={{ padding: '10px 18px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: sendingMessage || !newMessage.trim() ? 'not-allowed' : 'pointer', opacity: (sendingMessage || !newMessage.trim()) ? 0.5 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {view === 'profile' && <ProfileSection user={user} onBack={() => setView('browse')} />}

      </div>

      <QuickAvailabilityModal isOpen={showQuickAvailModal} onClose={() => setShowQuickAvailModal(false)} onSuccess={() => showToast("Availability posted! The network can now see you're open for work.")} userId={user?.id || null} />
      <FloatingAssistant route="/dashboard" pageTitle="Dashboard" pageDescription="Contractor dashboard — browse jobs, manage posted work, messages" pageStateSummary="Dashboard view — browsing, posted jobs, messages, vetting status" userRole="contractor" isLoggedIn={!!user} />
    </div>
  )
}

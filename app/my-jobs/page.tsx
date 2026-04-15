'use client'

import { useState, useEffect } from 'react'
import StarRating from '@/components/StarRating'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useNavContext } from '@/app/components/NavContext'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function MyJobs() {
  // Canonical access for data loading (supersedes inline supabase.auth.getSession).
  const { access } = useNavContext()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<Record<string, any>>({})
  const [reviewForm, setReviewForm] = useState<Record<string, { rating: number; comment: string }>>({})
  const [reviewSubmitted, setReviewSubmitted] = useState<Set<string>>(new Set())
  const [messageThreads, setMessageThreads] = useState<Record<string, any>>({})
  const [activeThread, setActiveThread] = useState<any>(null)
  const [threadMessages, setThreadMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState('')
  const [view, setView] = useState<'jobs' | 'messages'>('jobs')

  // Canonical data loading using access.profile.id.
  // Auth gate: after Supabase session is established, access.isAuthenticated drives visibility.
  useEffect(() => {
    if (!access.checked) return
    if (!access.isAuthenticated) { setLoading(false); return }
    const contractorId = access.profile?.id ?? null
    if (!contractorId) { setLoading(false); return }
    loadUserData(contractorId)
  }, [access.checked, access.isAuthenticated, access.profile])

  const loadUserData = (contractorId: string) => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
      fetch(`/api/reviews?contractor_id=${contractorId}`).then(r => r.json()),
      fetch(`/api/messages/threads?contractor_id=${contractorId}`).then(r => r.json()),
    ]).then(([users, jobsData, reviewsData, threadsData]) => {
      const found = users.find((u: any) => String(u.id) === String(contractorId))
      if (found) setUser(found)
      setJobs(jobsData || [])
      if (reviewsData?.averages) setReviews(reviewsData.averages)
      const byJob: Record<string, any> = {}
      for (const t of threadsData || []) byJob[t.job_id] = t
      setMessageThreads(byJob)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleSendMessage = async (jobId: string) => {
    if (!newMessage.trim() || !user) return
    setSendingMessage(true)
    const thread = messageThreads[jobId]
    try {
      if (!thread) {
        const job = jobs.find(j => j.id === jobId)
        const res = await fetch('/api/messages/threads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId, homeowner_email: job?.homeowner_email || 'unknown@example.com', contractor_id: user.id }),
        })
        const newThread = await res.json()
        setMessageThreads(prev => ({ ...prev, [jobId]: newThread }))
        setActiveThread(newThread)
      }
      const tid = thread?.id || activeThread?.id
      if (!tid) return
      await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: tid, sender_email: user.email, sender_name: user.name || user.full_name || user.company || 'Contractor', content: newMessage }),
      })
      setNewMessage('')
      const msgs = await fetch(`/api/messages?thread_id=${tid}`).then(r => r.json())
      setThreadMessages(msgs)
    } catch { /* silent */ } finally { setSendingMessage(false) }
  }

  const openThread = async (thread: any) => {
    setActiveThread(thread)
    const msgs = await fetch(`/api/messages?thread_id=${thread.id}`).then(r => r.json())
    setThreadMessages(msgs || [])
  }

  const handleSubmitReview = async (contractorId: string) => {
    setReviewError('')
    const form = reviewForm[contractorId]
    if (!form || !form.rating) return
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId, homeowner_name: user?.name || user?.full_name || 'Homeowner', rating: form.rating, comment: form.comment, reviewer_id: user?.id || null, reviewer_type: 'contractor' }),
      })
      if (res.ok) {
        setReviewSubmitted(prev => new Set([...prev, contractorId]))
        setShowReviewForm(null)
      }
    } catch { setReviewError('Failed to submit review.') }
  }

  const myPostedJobs = jobs.filter(j => j.poster_id === user?.id || j.homeowner_email === user?.email)
  const contractorJobsInProgress = jobs.filter(j => j.contractor_id === user?.id && (j.status === 'in_progress' || j.status === 'awarded'))
  const completedJobs = jobs.filter(j => j.contractor_id === user?.id && j.status === 'completed')
  const threadList = Object.values(messageThreads) as any[]

  // Auth gate — before loading check. Use canonical access state.
  if (!access.isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to access your jobs</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>Manage your posted work and track active projects.</p>
          <a href="/founder-login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/apply" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Apply to Join</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 32px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 96, borderRadius: 12, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', animation: 'pulse 2s ease-in-out infinite' }} />)}
          </div>
          {[1,2].map(i => (
            <div key={i} style={{ padding: 24, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, marginBottom: 14 }}>
              <div style={{ height: 16, borderRadius: 4, backgroundColor: 'var(--color-surface)', width: '40%', marginBottom: 12 }} />
              <div style={{ height: 12, borderRadius: 4, backgroundColor: 'var(--color-surface)', width: '70%' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 380, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '32px 28px', boxShadow: '0 4px 24px var(--color-shadow)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', marginBottom: 8 }}>Sign In to Continue</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>Sign in to manage your posted jobs and message contractors.</p>
          <a href="/login" style={{ display: 'block', padding: '11px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center', textDecoration: 'none', marginBottom: 10 }}>
            Sign In
          </a>
          <a href="/apply" style={{ display: 'block', padding: '11px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textAlign: 'center', textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>
            Apply to Join
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Page header */}
      <div style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 4 }}>My Jobs</h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage your posted work and conversations.</p>
            </div>
            <a href="/post-job" style={{ padding: '9px 18px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
              Post a Job
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { value: myPostedJobs.length, label: 'Posted', color: 'var(--color-blue)' },
              { value: contractorJobsInProgress.length, label: 'In Progress', color: 'var(--color-green)' },
              { value: completedJobs.length, label: 'Completed', color: 'var(--color-text)' },
              { value: threadList.length, label: 'Conversations', color: 'var(--color-text-muted)' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '14px 16px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 60, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', gap: 0, height: 48, alignItems: 'center' }}>
            {[
              { key: 'jobs', label: 'My Jobs' },
              { key: 'messages', label: 'Messages', count: threadList.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key as 'jobs' | 'messages')}
                style={{
                  padding: '0 16px',
                  height: '100%',
                  fontSize: 13,
                  fontWeight: view === tab.key ? 600 : 400,
                  color: view === tab.key ? 'var(--color-blue)' : 'var(--color-text-subtle)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: view === tab.key ? '2px solid var(--color-blue)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 32px 64px' }}>

        {/* ── JOBS VIEW ── */}
        {view === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* In Progress */}
            {contractorJobsInProgress.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  In Progress
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {contractorJobsInProgress.map(job => {
                    const rating = reviews[job.contractor_id]
                    return (
                      <div key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>
                                In Progress
                              </span>
                              {rating && <span style={{ fontSize: 11, color: '#F59E0B' }}>★ {rating}/5</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              {job.area && (
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {job.area}
                                </span>
                              )}
                              {job.budget_min && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-green)' }}>${job.budget_min.toLocaleString()}</span>
                              )}
                              {job.scope && (
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>{job.scope}</span>
                              )}
                            </div>
                          </div>
                          <a href={`/jobs/${job.id}`} style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8, backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-muted)', textDecoration: 'none', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                            View
                          </a>
                        </div>

                        <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                          <button
                            onClick={async () => {
                              if (!messageThreads[job.id]) {
                                const res = await fetch('/api/messages/threads', {
                                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ job_id: job.id, homeowner_email: job.homeowner_email || 'unknown@example.com', contractor_id: user.id }),
                                })
                                const newThread = await res.json()
                                setMessageThreads(prev => ({ ...prev, [job.id]: newThread }))
                                setView('messages'); setActiveThread(newThread)
                              } else {
                                setView('messages'); setActiveThread(messageThreads[job.id])
                              }
                            }}
                            style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            Message
                          </button>

                          {job.contractor_id && !reviewSubmitted.has(job.contractor_id) && showReviewForm !== job.contractor_id && (
                            <button
                              onClick={() => setShowReviewForm(job.contractor_id)}
                              style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              Leave Review
                            </button>
                          )}
                        </div>

                        {showReviewForm === job.contractor_id && (
                          <div style={{ marginTop: 14, padding: 16, backgroundColor: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>Rate this contractor</p>
                            <StarRating interactive rating={reviewForm[job.contractor_id]?.rating || 0} onRate={(r) => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...prev[job.contractor_id], rating: r } }))} size="lg" />
                            <textarea
                              placeholder="Comment (optional)"
                              value={reviewForm[job.contractor_id]?.comment || ''}
                              onChange={e => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...prev[job.contractor_id], comment: e.target.value } }))}
                              style={{ width: '100%', marginTop: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: 64 }}
                              rows={2}
                            />
                            {reviewError && <p style={{ fontSize: 11, color: 'var(--color-red)', marginTop: 6 }}>{reviewError}</p>}
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button onClick={() => handleSubmitReview(job.contractor_id)} disabled={!reviewForm[job.contractor_id]?.rating} style={{ padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !reviewForm[job.contractor_id]?.rating ? 0.5 : 1 }}>
                                Submit
                              </button>
                              <button onClick={() => setShowReviewForm(null)} style={{ padding: '7px 12px', borderRadius: 8, backgroundColor: 'transparent', color: 'var(--color-text-subtle)', fontSize: 12, border: 'none', cursor: 'pointer' }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {reviewSubmitted.has(job.contractor_id) && (
                          <p style={{ fontSize: 12, color: 'var(--color-green)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Review submitted
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Posted Jobs */}
            {myPostedJobs.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  My Posted Jobs
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myPostedJobs.map(job => (
                    <div key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                              backgroundColor: job.status === 'open' ? 'var(--color-green-soft)' : 'var(--color-blue-soft)',
                              color: job.status === 'open' ? 'var(--color-green)' : 'var(--color-blue)',
                            }}>
                              {job.status === 'open' ? 'Open' : job.status}
                            </span>
                            {job.is_verified_homeowner && (
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>Verified</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            {job.area && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</span>}
                            {job.budget_min && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-green)' }}>${job.budget_min.toLocaleString()}</span>}
                            {job.scope && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', fontWeight: 600 }}>{job.scope}</span>}
                            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{timeAgo(job.created_at)}</span>
                          </div>
                        </div>
                        <a href={`/jobs/${job.id}`} style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8, backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-muted)', textDecoration: 'none', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Completed
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {completedJobs.map(job => (
                    <div key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
                            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Completed</span>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{job.area}</span>
                        </div>
                      </div>

                      {!reviewSubmitted.has(job.contractor_id) && showReviewForm !== job.contractor_id && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <a href="/post-job" style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Post Another Job
                          </a>
                          <button
                            onClick={() => setShowReviewForm(job.contractor_id)}
                            style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            Leave a Review
                          </button>
                        </div>
                      )}

                      {showReviewForm === job.contractor_id && (
                        <div style={{ marginTop: 12, padding: 16, backgroundColor: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>Rate your experience</p>
                          <StarRating interactive rating={reviewForm[job.contractor_id]?.rating || 0} onRate={(r) => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...prev[job.contractor_id], rating: r } }))} size="lg" />
                          <textarea
                            placeholder="Comment (optional)"
                            value={reviewForm[job.contractor_id]?.comment || ''}
                            onChange={e => setReviewForm(prev => ({ ...prev, [job.contractor_id]: { ...prev[job.contractor_id], comment: e.target.value } }))}
                            style={{ width: '100%', marginTop: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: 64 }}
                            rows={2}
                          />
                          {reviewError && <p style={{ fontSize: 11, color: 'var(--color-red)', marginTop: 6 }}>{reviewError}</p>}
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button onClick={() => handleSubmitReview(job.contractor_id)} disabled={!reviewForm[job.contractor_id]?.rating} style={{ padding: '7px 14px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !reviewForm[job.contractor_id]?.rating ? 0.5 : 1 }}>
                              Submit
                            </button>
                            <button onClick={() => setShowReviewForm(null)} style={{ padding: '7px 12px', borderRadius: 8, backgroundColor: 'transparent', color: 'var(--color-text-subtle)', fontSize: 12, border: 'none', cursor: 'pointer' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {reviewSubmitted.has(job.contractor_id && (job.contractor_id || '')) && (
                        <p style={{ fontSize: 12, color: 'var(--color-green)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Thanks for your review!
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state for authenticated contractors */}
            {myPostedJobs.length === 0 && contractorJobsInProgress.length === 0 && completedJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 32px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                  No posted jobs yet
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.65 }}>
                  Post your overflow at your fixed rate. Contractors in the network will see it and respond if they&apos;re available. No bidding, no ads, no lead fees.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/post-job" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                    Post your first job
                  </a>
                  <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid var(--color-border)' }}>
                    Browse open jobs
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES VIEW ── */}
        {view === 'messages' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 16, minHeight: 480 }}>
            {/* Thread list */}
            <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Conversations</h2>
                {threadList.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>
                    {threadList.length}
                  </span>
                )}
              </div>

              {threadList.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 0' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 10, opacity: 0.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>No conversations</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>Award a contractor on one of your posted jobs to start messaging.</p>
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {threadList.map((thread: any) => (
                    <button
                      key={thread.id}
                      onClick={() => openThread(thread)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        backgroundColor: activeThread?.id === thread.id ? 'var(--color-blue-soft)' : 'var(--color-surface)',
                        border: activeThread?.id === thread.id ? '1px solid rgba(37,99,235,0.2)' : '1px solid var(--color-border)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {thread.jobs?.title || `Job ${thread.job_id?.slice(0, 8)}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {thread.last_message || 'No messages yet'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message thread */}
            <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
              {!activeThread ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Select a conversation</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Choose a thread to view messages.</p>
                </div>
              ) : (
                <>
                  <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                      {activeThread.jobs?.title || `Job ${activeThread.job_id?.slice(0, 8)}`}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{activeThread.jobs?.area || 'Location not specified'}</p>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 0 }}>
                    {threadMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', paddingTop: 24 }}>
                        <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      threadMessages.map((msg: any) => (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: msg.sender_email === user.email ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: msg.sender_email === user.email ? 'var(--color-blue)' : 'var(--color-surface)', border: msg.sender_email === user.email ? 'none' : '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: msg.sender_email === user.email ? '#fff' : 'var(--color-text-muted)', flexShrink: 0 }}>
                            {(msg.sender_name || msg.sender_email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ maxWidth: '72%' }}>
                            <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginBottom: 3, textAlign: msg.sender_email === user.email ? 'right' : 'left', paddingLeft: msg.sender_email === user.email ? 0 : 30 }}>
                              {msg.sender_name || msg.sender_email}
                            </div>
                            <div style={{
                              padding: '9px 13px', borderRadius: 12,
                              backgroundColor: msg.sender_email === user.email ? 'var(--color-blue)' : 'var(--color-surface)',
                              color: msg.sender_email === user.email ? '#fff' : 'var(--color-text)',
                              border: msg.sender_email === user.email ? 'none' : '1px solid var(--color-border)',
                              fontSize: 13, lineHeight: 1.5,
                              borderBottomLeftRadius: msg.sender_email === user.email ? 12 : 3,
                              borderBottomRightRadius: msg.sender_email === user.email ? 3 : 12,
                            }}>
                              {msg.content}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 3, textAlign: msg.sender_email === user.email ? 'right' : 'left', paddingLeft: msg.sender_email === user.email ? 0 : 30 }}>
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !sendingMessage) handleSendMessage(activeThread.job_id) }}
                      placeholder="Type a message…"
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--color-input-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-input-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={() => handleSendMessage(activeThread.job_id)}
                      disabled={sendingMessage || !newMessage.trim()}
                      style={{ padding: '10px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: sendingMessage || !newMessage.trim() ? 'not-allowed' : 'pointer', opacity: (sendingMessage || !newMessage.trim()) ? 0.5 : 1 }}
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <FloatingAssistant
        route="/my-jobs"
        pageTitle="My Jobs"
        pageDescription="My jobs page — managing awarded, in-progress, and completed work"
        pageStateSummary="My jobs — viewing contractor's own awarded and in-progress jobs"
        userRole="contractor"
        isLoggedIn={true}
      />
    </div>
  )
}

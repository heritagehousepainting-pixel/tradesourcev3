'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNavContext } from '@/app/components/NavContext'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{
          fontSize: 16,
          color: rating >= star ? '#F59E0B' : 'var(--color-border)',
        }}>★</span>
      ))}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (weeks === 1) return '1 week ago'
  if (weeks < 5) return `${weeks} weeks ago`
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}

export default function ReviewsPage() {
  const { access } = useNavContext()
  const router = useRouter()

  const [myReviews, setMyReviews] = useState<any[]>([])
  const [myRating, setMyRating] = useState<number | null>(null)
  const [completedJobs, setCompletedJobs] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState<Record<string, { rating: number; comment: string }>>({})
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null)
  const [reviewSubmitted, setReviewSubmitted] = useState<Set<string>>(new Set())
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const user = access.profile

  // Redirect unauthenticated
  useEffect(() => {
    if (!access.checked) return
    if (!access.isAuthenticated) {
      router.push('/login?redirect=/reviews')
    }
  }, [access.checked, access.isAuthenticated, router])

  // Load data
  useEffect(() => {
    if (!access.checked || !user?.id) return
    Promise.all([
      fetch('/api/reviews?contractor_id=' + user.id).then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
    ]).then(([reviewsData, jobsData]) => {
      if (reviewsData?.reviews) {
        setMyReviews(reviewsData.reviews)
        const r = reviewsData.reviews
        if (r.length > 0) {
          setMyRating(Math.round((r.reduce((s: number, x: any) => s + x.rating, 0) / r.length) * 10) / 10)
        }
      }
      const jobs = Array.isArray(jobsData) ? jobsData : []
      setAllJobs(jobs)
      // Jobs where this contractor was awarded and status is completed
      const completed = jobs.filter((j: any) =>
        j.contractor_id === user.id && j.status === 'completed'
      )
      setCompletedJobs(completed)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [access.checked, user?.id])

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
        setToast('Review submitted! Thanks.')
        setTimeout(() => setToast(''), 4000)
        // Refresh reviews
        const data = await fetch('/api/reviews?contractor_id=' + user?.id).then(r => r.json())
        if (data?.reviews) {
          setMyReviews(data.reviews)
          const r = data.reviews
          if (r.length > 0) {
            setMyRating(Math.round((r.reduce((s: number, x: any) => s + x.rating, 0) / r.length) * 10) / 10)
          }
        }
      }
    } catch {
      setToast('Failed to submit review.')
      setTimeout(() => setToast(''), 4000)
    }
  }

  if (!access.checked || !access.isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Redirecting to sign in…</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Page header */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Dashboard
          </a>
          <span style={{ color: 'var(--color-border)', fontSize: 16 }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Reviews</span>
        </div>
        {toast && (
          <span style={{ fontSize: 13, color: toast.includes('Failed') ? 'var(--color-red)' : 'var(--color-green)', fontWeight: 600 }}>{toast}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 24px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>

        {/* Rating summary */}
        <div style={{
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: myRating ? '#F59E0B' : 'var(--color-text-subtle)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {myRating ? myRating.toFixed(1) : '—'}
            </div>
            <StarDisplay rating={myRating || 0} />
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>Your rating</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>Your Reviews</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
              {myReviews.length === 0
                ? 'No reviews yet. Complete jobs to build your reputation on the network.'
                : `You have ${myReviews.length} review${myReviews.length !== 1 ? 's' : ''} on TradeSource.`}
            </p>
          </div>
        </div>

        {/* Reviews received */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '-0.01em' }}>
            Reviews Received
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>Loading…</p>
            </div>
          ) : myReviews.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '40px 32px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>★</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>No reviews yet</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Complete your first awarded job to start receiving reviews from other contractors.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myReviews.map((review: any) => (
                <div key={review.id} style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
                      {timeAgo(review.created_at)}
                    </span>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.65, marginBottom: 10 }}>
                      {review.comment}
                    </p>
                  )}
                  {review.job_id && (
                    <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
                      For: {allJobs.find((j: any) => j.id === review.job_id)?.title || review.job_id?.slice(0, 8) + '…'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave reviews for completed jobs */}
        {completedJobs.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '-0.01em' }}>
              Leave Reviews
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {completedJobs.map(job => {
                const alreadyReviewed = reviewSubmitted.has(job.id)
                const showForm = showReviewForm === job.id
                const posterName = job.homeowner_name || job.poster_id?.slice(0, 8) + '…'
                return (
                  <div key={job.id} style={{
                    backgroundColor: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    padding: '20px 24px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: alreadyReviewed || showForm ? 0 : 12, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                          {job.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
                          {job.area} · Completed
                        </p>
                      </div>
                      {!alreadyReviewed && !showForm && (
                        <button
                          onClick={() => setShowReviewForm(job.id)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            backgroundColor: '#F59E0B', color: '#fff', border: 'none',
                            cursor: 'pointer', flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                          }}
                        >
                          Leave Review
                        </button>
                      )}
                      {alreadyReviewed && (
                        <span style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)',
                          flexShrink: 0,
                        }}>
                          ✓ Review Submitted
                        </span>
                      )}
                    </div>

                    {showForm && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                        {/* Star rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginRight: 4 }}>Rating:</span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setReviewForm(prev => ({
                                ...prev,
                                [job.contractor_id]: {
                                  ...(prev[job.contractor_id] || {}),
                                  rating: star,
                                  comment: prev[job.contractor_id]?.comment || '',
                                },
                              }))}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 24, lineHeight: 1, padding: '0 2px',
                                color: (reviewForm[job.contractor_id]?.rating || 0) >= star ? '#F59E0B' : 'var(--color-border-strong)',
                              }}
                            >★</button>
                          ))}
                          {(reviewForm[job.contractor_id]?.rating || 0) > 0 && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>
                              {reviewForm[job.contractor_id].rating}/5
                            </span>
                          )}
                        </div>

                        {/* Comment */}
                        <textarea
                          value={reviewForm[job.contractor_id]?.comment || ''}
                          onChange={e => setReviewForm(prev => ({
                            ...prev,
                            [job.contractor_id]: {
                              ...(prev[job.contractor_id] || {}),
                              comment: e.target.value,
                            },
                          }))}
                          placeholder="Share your experience working with this contractor…"
                          rows={3}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
                            border: '1.5px solid var(--color-input-border)',
                            backgroundColor: 'var(--color-input-bg)',
                            color: 'var(--color-input-text)', fontFamily: 'inherit',
                            resize: 'vertical', outline: 'none', lineHeight: 1.6,
                          }}
                        />

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleSubmitReview(job.contractor_id, job.id, posterName)}
                            disabled={!reviewForm[job.contractor_id]?.rating}
                            style={{
                              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              backgroundColor: reviewForm[job.contractor_id]?.rating ? '#F59E0B' : 'var(--color-border)',
                              color: reviewForm[job.contractor_id]?.rating ? '#fff' : 'var(--color-text-subtle)',
                              border: 'none',
                              cursor: reviewForm[job.contractor_id]?.rating ? 'pointer' : 'not-allowed',
                              opacity: reviewForm[job.contractor_id]?.rating ? 1 : 0.7,
                            }}
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => setShowReviewForm(null)}
                            style={{
                              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              backgroundColor: 'transparent', color: 'var(--color-text-muted)',
                              border: '1px solid var(--color-border)', cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

          {/* Left content closes */}
          </div>

          {/* ── Right: Reputation Stats Sidebar (desktop only) ── */}
          <div data-reviews-sidebar style={{
            width: 260, flexShrink: 0,
            display: 'none',
          }}>
            <div style={{
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '20px',
              position: 'sticky',
              top: 80,
            }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                Your Reputation
              </h3>

              {/* Big rating */}
              <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-divider)', marginBottom: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: myRating ? '#F59E0B' : 'var(--color-border-strong)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {myRating ? myRating.toFixed(1) : '—'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 6 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: 14, color: (myRating || 0) >= s ? '#F59E0B' : 'var(--color-border-strong)' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                  {myReviews.length} review{myReviews.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Reputation tier */}
              {myRating ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                    {myRating >= 4.5 ? 'Outstanding' : myRating >= 4.0 ? 'Strong' : myRating >= 3.0 ? 'Building' : 'Getting started'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
                    {myRating >= 4.5 ? 'Contractors rank you among the best in the network.' :
                      myRating >= 4.0 ? 'Homeowners consistently rate their experience positively.' :
                      myRating >= 3.0 ? 'Building a track record across more completed jobs will strengthen your profile.' :
                      'Completing more jobs and earning reviews will help establish your reputation.'}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Not yet rated</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
                    Complete your first awarded job to start receiving reviews from other contractors.
                  </div>
                </div>
              )}

              {/* Review breakdown */}
              {myReviews.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Review breakdown</div>
                  {[5,4,3,2,1].map(star => {
                    const count = myReviews.filter((r: any) => r.rating === star).length
                    if (count === 0 && star < 5) return null
                    const pct = Math.round((count / myReviews.length) * 100)
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-subtle)', width: 14 }}>{star}★</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: pct + '%', backgroundColor: '#F59E0B', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--color-text-subtle)', width: 28, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* CTA */}
              <a href="/post-job" style={{
                display: 'block', textAlign: 'center',
                padding: '9px 16px', borderRadius: 8,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: 12, fontWeight: 600,
                color: 'var(--color-blue)',
                textDecoration: 'none',
                boxShadow: 'var(--ts-shadow-card)',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
                Post work to earn reviews
              </a>
            </div>
          </div>
        </div>
      </div>

      <FloatingAssistant route="/reviews" pageTitle="Reviews" pageDescription="Contractor reviews — view your ratings and leave reviews for completed jobs" pageStateSummary="Reviews page — rating summary, reviews received, and leave-review form" userRole="contractor" isLoggedIn={!!user} />
    </div>
  )
}

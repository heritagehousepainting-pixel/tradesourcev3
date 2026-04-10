'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import StarRating from '@/components/StarRating'

export default function ContractorProfile() {
  const { id } = useParams<{ id: string }>()
  const [contractor, setContractor] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [completedJobs, setCompletedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAllReviews, setShowAllReviews] = useState(false)
  const reviewsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return

    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch(`/api/reviews?contractor_id=${id}`).then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
    ]).then(([users, reviewsData, jobsData]) => {
      const found = users.find((u: any) => String(u.id) === String(id))
      if (!found) {
        setError('Contractor not found.')
        setLoading(false)
        return
      }
      setContractor(found)

      if (reviewsData?.reviews) {
        const contractorReviews = reviewsData.reviews.filter(
          (r: any) => String(r.contractor_id) === String(id)
        )
        setReviews(contractorReviews)
      }

      if (jobsData) {
        const completed = jobsData.filter((j: any) =>
          String(j.contractor_id) === String(id) && j.status === 'completed'
        )
        setCompletedJobs(completed)
      }

      setLoading(false)
    }).catch(() => {
      setError('Failed to load contractor profile.')
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <header style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <a href="/jobs" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </a>
          </div>
        </header>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 rounded-2xl" style={{ backgroundColor: 'var(--color-divider)' }} />
            <div className="h-48 rounded-2xl" style={{ backgroundColor: 'var(--color-divider)' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <header style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <a href="/jobs" className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>← Back</a>
          </div>
        </header>
        <div className="max-w-4xl mx-auto p-6 text-center py-20">
          <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{error || 'Contractor not found'}</p>
          <a href="/jobs" className="mt-4 inline-block text-sm font-medium px-6 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--color-surface-raised)', color: '#fff' }}>Browse Jobs</a>
        </div>
      </div>
    )
  }

  const fullName = contractor.full_name || contractor.name
  const businessName = contractor.business_name || contractor.company
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--color-surface-raised)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/jobs" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </a>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}>Phase 1</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile card */}
        <div className="bg-transparent rounded-2xl p-6 mb-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
              {(fullName || businessName || 'C').charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                    {businessName || fullName || 'Contractor'}
                  </h1>
                  {businessName && fullName && (
                    <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{fullName}</p>
                  )}
                </div>
                {contractor.is_pro && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-text)' }}>Pro</span>
                )}
              </div>

              {/* Verification badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {contractor.verified_license && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    License Verified{contractor.license_state ? ` — ${contractor.license_state}` : ''}
                  </span>
                )}
                {contractor.verified_insurance && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Insurance Confirmed
                  </span>
                )}
                {contractor.verified_w9 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    W-9 Verified
                  </span>
                )}
                {!contractor.verified_license && !contractor.verified_insurance && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-orange)', color: 'var(--color-orange)', border: '1px solid #FDE68A' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Pending Verification
                  </span>
                )}
              </div>

              {/* Specialization */}
              {contractor.trade_specialization && (
                <div className="mt-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid #D1E0EE' }}>
                    {contractor.trade_specialization}
                  </span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-5 mt-4">
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold" style={{ color: 'var(--color-orange)' }}>{avgRating}</span>
                    <StarRating rating={parseFloat(avgRating as string)} size="lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllReviews(true)
                        setTimeout(() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#9CA3AF', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#9CA3AF' }}
                    >
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </button>
                  </div>
                )}
                {!avgRating && (
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>No reviews yet</span>
                )}
                {contractor.years_in_trade > 0 && (
                  <span className="text-sm" style={{ color: '#6B7280' }}>
                    {contractor.years_in_trade} years in trade
                  </span>
                )}
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  {completedJobs.length} completed job{completedJobs.length !== 1 ? 's' : ''} on TradeSource
                </span>
                {contractor.insurance_expiry && (
                  <span className="text-sm" style={{ color: '#6B7280' }}>
                    Insurance expires {new Date(contractor.insurance_expiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {(showAllReviews || reviews.length <= 3) && reviews.length > 0 && (
          <div ref={reviewsRef} id="reviews" className="bg-transparent rounded-2xl p-6 mb-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {showAllReviews ? 'All Reviews' : 'Reviews'}
              </h2>
              <button
                onClick={() => setShowAllReviews(false)}
                style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500 }}
              >
                Collapse
              </button>
            </div>
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {review.homeowner_name && (
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>· {review.homeowner_name}</span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{review.comment}</p>
                  )}
                  {!review.comment && (
                    <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No written comment</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length > 3 && !showAllReviews && (
          <div className="bg-transparent rounded-2xl p-6 mb-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Reviews (first 3 of {reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review: any) => (
                <div key={review.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {review.homeowner_name && (
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>· {review.homeowner_name}</span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{review.comment}</p>
                  )}
                  {!review.comment && (
                    <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No written comment</p>
                  )}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', paddingTop: 16 }}>
              <button
                onClick={() => { setShowAllReviews(true); reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                style={{ background: 'var(--color-blue)', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
              >
                Show all {reviews.length} reviews
              </button>
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="bg-transparent rounded-2xl p-10 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>No reviews yet</p>
            <p className="text-sm" style={{ color: '#6B7280' }}>Reviews are earned after completing jobs on TradeSource.</p>
          </div>
        )}

        {/* Honest disclaimer */}
        <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Verification indicates required documents have been submitted. TradeSource does not independently verify document authenticity or contractor competence. Always conduct your own due diligence.
          </p>
        </div>
      </div>
      <FloatingAssistant
        route="/contractors/[id]"
        pageTitle="Contractor Profile"
        pageDescription="Contractor profile — vetting status, ratings, verified credentials"
        pageStateSummary="Profile page — viewing contractor details, ratings, and verification status"
        userRole="contractor"
        isLoggedIn={false}
      />
    </div>
  )
}

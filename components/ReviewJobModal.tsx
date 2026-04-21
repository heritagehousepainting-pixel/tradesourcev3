'use client'

import { useState } from 'react'

interface ReviewJobModalProps {
  isOpen: boolean
  job: any
  onSubmit: (rating: number, comment: string) => Promise<void>
  onSkip: () => Promise<void>
  onClose: () => void
}

export default function ReviewJobModal({ isOpen, job, onSubmit, onSkip, onClose }: ReviewJobModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [skipping, setSkipping] = useState(false)

  if (!isOpen || !job) return null

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    try { await onSubmit(rating, comment) } finally { setSubmitting(false) }
  }
  const handleSkip = async () => {
    setSkipping(true)
    try { await onSkip() } finally { setSkipping(false) }
  }

  const display = hovered || rating

  return (
    <div className="ts-modal-overlay" onClick={onClose}>
      <div className="ts-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="ts-modal-body">
          <div className="ts-modal-head">
            <div>
              <div className="ts-page-kicker" style={{ color: '#FBBF24', marginBottom: 10 }}>Mark complete &amp; review</div>
              <h2 className="ts-modal-title">How was <em style={{ fontStyle: 'normal', color: '#93C5FD', fontWeight: 700 }}>{job.title}</em>?</h2>
              {job.area && <p className="ts-modal-sub">{job.area}</p>}
            </div>
            <button onClick={onClose} className="ts-modal-close" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.6)', lineHeight: 1.65, marginBottom: 22 }}>
            You&apos;re marking this job as complete. While you&apos;re here — rate your experience. Reviews build trust across the whole network.
          </p>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 22 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 38, lineHeight: 1, padding: '2px 4px',
                  color: display >= star ? '#FBBF24' : 'rgba(255,255,255,0.14)',
                  transition: 'transform .1s, color .1s',
                  transform: display === star ? 'scale(1.08)' : 'scale(1)',
                }}>★</button>
            ))}
            {rating > 0 ? (
              <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>{rating} / 5</span>
            ) : (
              <span style={{ marginLeft: 10, fontSize: 12, color: 'rgba(248,250,252,0.4)' }}>Tap a star to rate</span>
            )}
          </div>

          <textarea className="ts-textarea" rows={3} value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="What went well? Communication, quality, timing… (optional)"
            style={{ marginBottom: 20 }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSubmit} disabled={!rating || submitting || skipping}
              className={rating ? 'ts-action ts-action--blue' : 'ts-action ts-action--ghost'}
              style={{ flex: 1 }}>
              {submitting ? 'Submitting…' : 'Submit review &amp; complete'}
            </button>
            <button onClick={handleSkip} disabled={submitting || skipping}
              className="ts-action ts-action--ghost">
              {skipping ? '…' : 'Skip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

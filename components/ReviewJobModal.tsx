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

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)
    try {
      await onSubmit(rating, comment)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSkip() {
    setSkipping(true)
    try {
      await onSkip()
    } finally {
      setSkipping(false)
    }
  }

  const displayRating = hovered || rating

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 18,
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'fadeInUp 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F59E0B' }}>
                How was this job?
              </span>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 2 }}>
              {job.title}
            </h2>
            {job.area && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: 4, flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Prompt */}
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
          You're about to mark this job as complete. While you're here — rate your experience. Your review helps the whole network trust quality contractors.
        </p>

        {/* Star rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 36, lineHeight: 1, padding: '2px',
                color: displayRating >= star ? '#F59E0B' : 'var(--color-border-strong)',
                transition: 'transform 0.1s, color 0.1s',
                transform: displayRating === star ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
              {rating} out of 5
            </span>
          )}
          {rating === 0 && (
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--color-text-subtle)' }}>
              Tap a star to rate
            </span>
          )}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Describe your experience with this contractor — what went well, communication, quality… (optional)"
          rows={3}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1.5px solid var(--color-input-border)',
            backgroundColor: 'var(--color-input-bg)',
            color: 'var(--color-input-text)', fontSize: 13,
            fontFamily: 'inherit', resize: 'vertical', outline: 'none',
            lineHeight: 1.6, marginBottom: 20,
            boxSizing: 'border-box',
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={!rating || submitting || skipping}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 10,
              backgroundColor: rating ? '#F59E0B' : 'var(--color-border)',
              color: rating ? '#fff' : 'var(--color-text-subtle)',
              border: 'none',
              fontSize: 13, fontWeight: 700, cursor: rating ? 'pointer' : 'not-allowed',
              opacity: rating && !submitting ? 1 : 0.6,
              boxShadow: rating && !submitting ? '0 4px 14px rgba(245,158,11,0.25)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (rating && !submitting) { const el = e.currentTarget as HTMLElement; el.style.background = '#D97706'; el.style.boxShadow = '0 6px 18px rgba(245,158,11,0.35)' }}}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = rating ? '#F59E0B' : 'var(--color-border)'; el.style.boxShadow = rating ? '0 4px 14px rgba(245,158,11,0.25)' : 'none' }}
          >
            {submitting ? 'Submitting…' : 'Submit Review & Complete'}
          </button>
          <button
            onClick={handleSkip}
            disabled={submitting || skipping}
            style={{
              padding: '11px 16px', borderRadius: 10,
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              fontSize: 13, fontWeight: 600, cursor: skipping ? 'not-allowed' : 'pointer',
              opacity: skipping ? 0.6 : 1,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { if (!skipping) { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-surface)'; el.style.borderColor = 'var(--color-border-strong)' }}}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = 'var(--color-border)' }}
          >
            {skipping ? '…' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  )
}

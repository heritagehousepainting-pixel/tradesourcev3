'use client'

import { useState } from 'react'

interface QuickAvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string | null
}

export default function QuickAvailabilityModal({ isOpen, onClose, onSuccess, userId }: QuickAvailabilityModalProps) {
  const [tradeType] = useState('painting')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) { setError('Please add a short description of your availability.'); return }
    if (!startDate) { setError('Please select a start date.'); return }

    setSubmitting(true); setError('')

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: userId, trade_type: tradeType,
          start_date: startDate, end_date: endDate || null,
          description: description.trim(),
        }),
      })
      if (res.ok) {
        onSuccess(); onClose()
        setDescription(''); setStartDate(''); setEndDate('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post availability. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="ts-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ts-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="ts-modal-body">
          <div className="ts-modal-head">
            <div>
              <div className="ts-page-kicker" style={{ marginBottom: 10 }}>Quick availability</div>
              <h2 className="ts-modal-title">
                Tell the network you have a{' '}
                <em style={{ fontStyle: 'italic', color: '#93C5FD', fontFamily: "'Iowan Old Style', 'Source Serif Pro', Georgia, serif", fontWeight: 500 }}>gap</em>.
              </h2>
              <p className="ts-modal-sub">Get matched to overflow work from nearby contractors.</p>
            </div>
            <button onClick={onClose} className="ts-modal-close" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ts-field">
              <label className="ts-field-label">Trade</label>
              <div className="ts-input" style={{ color: 'rgba(248,250,252,0.5)', cursor: 'not-allowed' }}>Painting</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="ts-field">
                <label className="ts-field-label" htmlFor="avail-start">Start date <span className="ts-field-req">*</span></label>
                <input id="avail-start" type="date" className="ts-input" required
                  value={startDate} onChange={e => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="ts-field">
                <label className="ts-field-label" htmlFor="avail-end">End date <span style={{ opacity: 0.55, fontWeight: 500 }}>(optional)</span></label>
                <input id="avail-end" type="date" className="ts-input"
                  value={endDate} onChange={e => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="ts-field">
              <label className="ts-field-label" htmlFor="avail-desc">Describe your availability <span className="ts-field-req">*</span></label>
              <textarea id="avail-desc" className="ts-textarea" required rows={3} maxLength={200}
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Half day open Thursday — can take a small interior job" />
              <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.4)', textAlign: 'right' }}>
                {description.length}/200
              </div>
            </div>

            {error && (
              <div className="ts-chip ts-chip--err" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={submitting} className="ts-action ts-action--blue ts-action--lg" style={{ flex: 1 }}>
                {submitting ? (
                  <>
                    <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                    Posting…
                  </>
                ) : 'Post to network'}
              </button>
              <button type="button" onClick={onClose} className="ts-action ts-action--ghost ts-action--lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

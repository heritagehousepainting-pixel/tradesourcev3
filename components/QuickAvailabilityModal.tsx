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
    if (!description.trim()) {
      setError('Please add a short description of your availability.')
      return
    }
    if (!startDate) {
      setError('Please select a start date.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: userId,
          trade_type: tradeType,
          start_date: startDate,
          end_date: endDate || null,
          description: description.trim(),
        }),
      })

      if (res.ok) {
        onSuccess()
        onClose()
        setDescription('')
        setStartDate('')
        setEndDate('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post availability. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        style={{ border: '1px solid #E5E5E5' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#F0F4F8', color: '#0A2540' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: '#111111' }}>Quick Availability Post</h2>
              <p className="text-xs" style={{ color: '#6B7280' }}>Let the network know you have a gap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Trade type — pre-filled, not editable */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Trade</label>
            <div
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ border: '1px solid #E5E5E5', color: '#6B7280', backgroundColor: '#F9FAFB' }}
            >
              Painting
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ border: '1px solid #E5E5E5', color: '#111111', backgroundColor: '#FAFAFA' }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>
                End Date <span className="font-normal" style={{ color: '#9CA3AF' }}>(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ border: '1px solid #E5E5E5', color: '#111111', backgroundColor: '#FAFAFA' }}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Describe your availability</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Half day open Thursday — can take a small interior job"
              className="w-full rounded-xl px-4 py-3 text-sm resize-none"
              style={{ border: '1px solid #E5E5E5', color: '#111111', backgroundColor: '#FAFAFA' }}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs mt-1 text-right" style={{ color: '#9CA3AF' }}>{description.length}/200</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: '#0A2540' }}
          >
            {submitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post to Network
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

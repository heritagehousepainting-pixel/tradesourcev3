'use client'

import { useState, useEffect } from 'react'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useUserAccess } from '@/lib/auth/access.client'

const US_STATES = ['PA']
const TRADES = ['All Trades', 'Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Drywall Repair', 'Power Washing', 'Staining']

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just posted'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

type JobsClientProps = {
  initialJobs?: any[]
  networkContext?: {
    vettingNote?: string
    accessNote?: string
  }
  isAuthenticated?: boolean
}

export default function JobsClient({ initialJobs = [], networkContext, isAuthenticated = false }: JobsClientProps) {
  const access = useUserAccess()
  const [jobs, setJobs] = useState<any[]>(initialJobs)
  const [availabilityPosts, setAvailabilityPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(initialJobs.length === 0)
  const [error, setError] = useState('')
  const [expressingId, setExpressingId] = useState<string | null>(null)
  const [expressedJobs, setExpressedJobs] = useState<Set<string>>(new Set())
  const [tradeFilter, setTradeFilter] = useState('All Trades')
  const [searchQuery, setSearchQuery] = useState('')

  // Hydrate jobs client-side for dynamic express-interest state
  useEffect(() => {
    if (initialJobs.length > 0) {
      // Already server-fetched — no additional fetch needed for display
      setLoading(false)
      return
    }
    Promise.all([
      fetch('/api/jobs').then(r => r.ok ? r.json() : Promise.reject()).catch(() => []),
      fetch('/api/availability').then(r => r.ok ? r.json() : Promise.reject()).catch(() => []),
    ]).then(([jobsData, availData]) => {
      const jobsArr = Array.isArray(jobsData) ? jobsData : []
      if (jobsArr.length > 0) {
        const sorted = [...jobsArr].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setJobs(sorted)
      }
      setAvailabilityPosts(Array.isArray(availData) ? availData : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleExpressInterest = async (jobId: string) => {
    setExpressingId(jobId)
    setError('')
    try {
      const contractorId = access.profile?.id ?? null
      const res = await fetch(`/api/jobs/${jobId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId }),
      })
      if (res.ok) {
        setExpressedJobs(prev => new Set([...prev, jobId]))
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Failed to express interest.')
      }
    } catch {
      setError('Network error.')
    } finally {
      setExpressingId(null)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const tradeMatch = tradeFilter === 'All Trades' || (job.scope || '').toLowerCase().includes(tradeFilter.toLowerCase())
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchTitle = (job.title || '').toLowerCase().includes(q)
      const matchArea = (job.area || '').toLowerCase().includes(q)
      const matchDesc = (job.description || '').toLowerCase().includes(q)
      if (!matchTitle && !matchArea && !matchDesc) return false
    }
    return tradeMatch
  })

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div
        data-jobs-hero
        style={{
          background: 'linear-gradient(180deg, rgba(13,27,42,0.8) 0%, rgba(13,27,42,0.0) 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 32px' }}>
          {/* Trust badge — reinforces gating at the first point of public contact */}
          {networkContext?.vettingNote && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>
                {networkContext.vettingNote}
              </span>
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
            {searchQuery ? `Results for "${searchQuery}"` : 'Open Jobs'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Fixed-price painting work across the TradeSource private contractor network.
            {networkContext?.accessNote && jobs.filter(j => j.status === 'open').length === 0 && (
              <span style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
                {networkContext.accessNote}{' '}
                <a href="/apply" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}>Apply to join</a>
                {' '}to get access.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ─── SEARCH ─── */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 520 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search jobs by title or location…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 14px 8px 36px', borderRadius: 10,
                fontSize: 13, border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text)',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <div data-jobs-filter-bar style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {/* Horizontal scroll container — no wrapping, native scroll on mobile */}
        <div className="jobs-filter-scroll-container" style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 32px',
          gap: 10,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxWidth: 1100, margin: '0 auto',
        }}>
          {/* Clip gradient mask on right — signals scrollable content */}
          <style>{`.filter-scroll::-webkit-scrollbar { display: none } .filter-scroll { scrollbar-width: none; -ms-overflow-style: none; }`}</style>

          {/* Trade type — scrollable chip row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginRight: 2 }}>Trade:</span>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
              {['All', 'Interior Painting', 'Exterior Painting', 'Drywall Repair', 'Power Washing', 'Cabinet Painting', 'Staining'].map(trade => {
                const isActive = (trade === 'All' && tradeFilter === 'All Trades') || tradeFilter === trade
                return (
                  <button
                    key={trade}
                    onClick={() => setTradeFilter(trade === 'All' ? 'All Trades' : trade)}
                    style={{
                      padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
                      border: isActive ? '1.5px solid var(--color-blue)' : '1.5px solid var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-blue-soft)' : 'transparent',
                      color: isActive ? 'var(--color-blue)' : 'var(--color-text-muted)',
                      scrollSnapAlign: 'start',
                    }}
                  >
                    {trade}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          {tradeFilter !== 'All Trades' && (
            <div style={{ width: 1, height: 20, backgroundColor: 'var(--color-border)', flexShrink: 0 }} />
          )}

          {/* Clear */}
          {tradeFilter !== 'All Trades' && (
            <button
              onClick={() => setTradeFilter('All Trades')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          )}

          {/* Spacer — pushes count to far right */}
          <div style={{ flex: 1, flexShrink: 0 }} />

          {/* Live count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-green)' }}>
              {filteredJobs.filter(j => j.status === 'open').length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>open</span>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="jobs-content-area" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px' }}>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Auth nudge — unauthenticated contractors browsing jobs */}
        {!loading && !isAuthenticated && filteredJobs.filter(j => j.status === 'open').length > 0 && (
          <div style={{
            marginBottom: 24,
            padding: '16px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(37,99,235,0.06)',
            border: '1px solid rgba(37,99,235,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Want to express interest?</strong> {' '}Sign in to connect with job posters — or{' '}
                <a href="/apply" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}>apply for access</a>{' '}to join the network.
              </p>
            </div>
            <a href="/founder-login" style={{
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: 'var(--color-blue)',
              color: '#fff',
              fontSize: 12, fontWeight: 600,
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue-hover)'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue)'; el.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)' }}>Sign In</a>
          </div>
        )}

        {/* Availability strip */}
        {!loading && availabilityPosts.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Contractors Available Now</h2>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green)' }}>
                {availabilityPosts.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {availabilityPosts.slice(0, 3).map((post: any) => (
                <div key={post.id} style={{ padding: '16px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-blue)', flexShrink: 0 }}>
                      {(post.contractors?.full_name || post.contractors?.company || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{post.contractors?.full_name || post.contractors?.company || 'Contractor'}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-green)', marginTop: 2 }}>{post.trade_type || 'Painter'} · Available</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', lineHeight: 1.5 }}>{post.description?.slice(0, 100)}{post.description?.length > 100 ? '…' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: '24px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, animation: 'pulse 2s ease-in-out infinite' }}>
                <div style={{ height: 16, borderRadius: 4, backgroundColor: 'var(--color-divider)', width: '40%', marginBottom: 12 }} />
                <div style={{ height: 12, borderRadius: 4, backgroundColor: 'var(--color-surface)', width: '70%', marginBottom: 8 }} />
                <div style={{ height: 12, borderRadius: 4, backgroundColor: 'var(--color-surface)', width: '30%' }} />
              </div>
            ))}
          </div>
        ) : filteredJobs.filter(j => j.status === 'open').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            {jobs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  No open jobs right now
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6, textAlign: 'center' }}>
                  New jobs are posted daily.{' '}
                  <a href="/apply" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}>Apply to join</a>{' '}to get notified first.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 22 21 12 18 2 21 22 3"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  No matching jobs
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  Try a different trade or location.
                </p>
                <button
                  onClick={() => { setTradeFilter('All Trades'); setSearchQuery('') }}
                  style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.25)', transition: 'background 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue-hover)'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-blue)'; el.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="jobs-desktop-grid">
            {filteredJobs.filter(j => j.status === 'open').map((job, idx) => (
              <div className="job-card" key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '24px', boxShadow: 'var(--ts-shadow-card)', transition: 'box-shadow 0.2s, border-color 0.2s', animation: 'fadeInUp 0.35s ease-out', animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--ts-shadow-card-hover)'; el.style.borderColor = 'var(--color-blue-border)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--ts-shadow-card)'; el.style.borderColor = 'var(--color-border)' }}
            >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                        Open
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {job.scope && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                          {job.scope}
                        </span>
                      )}
                      {job.area && (
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{job.area}</span>
                      )}
                      <span style={{ fontSize: 10, color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                        {timeAgo(job.created_at)}
                      </span>
                    </div>
                  </div>
                  {job.budget_min && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-green)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        ${job.budget_min.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 2 }}>fixed rate</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 16,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {job.description}
                </p>

                {/* CTA row */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
                  <a
              href={access.isAuthenticated ? `/jobs/${job.id}` : '/founder-login'}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text)', border: '1px solid var(--color-border)', textDecoration: 'none', minHeight: 44, transition: 'background 0.2s, box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-surface-hover)'; el.style.borderColor = 'var(--color-blue-border)'; el.style.boxShadow = 'var(--ts-shadow-card-hover)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-bg-alt)'; el.style.borderColor = 'var(--color-border)'; el.style.boxShadow = 'none' }}
            >
              {access.isAuthenticated ? 'View Details' : 'Preview'}
            </a>

                  {access.canAccessContractorApp ? (
                    <button
                      onClick={() => handleExpressInterest(job.id)}
                      disabled={expressingId === job.id || expressedJobs.has(job.id)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '11px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        minHeight: 44,
                        cursor: expressedJobs.has(job.id) || expressingId === job.id ? 'default' : 'pointer',
                        backgroundColor: expressedJobs.has(job.id) ? 'rgba(16,185,129,0.15)' : 'var(--color-blue)',
                        color: expressedJobs.has(job.id) ? 'var(--color-green)' : '#fff',
                        border: '1px solid transparent',
                      }}
                    >
                      {expressedJobs.has(job.id) ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Interest Sent
                        </>
                      ) : expressingId === job.id ? (
                        <span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        "I'm Interested"
                      )}
                    </button>
                  ) : access.isAuthenticated ? (
                    <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, minHeight: 44, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                      Profile pending
                    </span>
                  ) : (
                    <a href="/founder-login" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, minHeight: 44, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                      Sign in to express interest
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FloatingAssistant
        route="/browse"
        pageTitle="Browse Jobs"
        pageDescription="Contractor job listing page showing available overflow jobs"
        pageStateSummary={`Browse view — ${access.isAuthenticated ? 'authenticated contractor' : 'public preview'}`}
        userRole="contractor"
        isLoggedIn={access.isAuthenticated}
      />
    </>
  )
}
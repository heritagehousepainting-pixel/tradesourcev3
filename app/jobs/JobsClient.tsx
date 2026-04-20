'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useUserAccess } from '@/lib/auth/access.client'
import { signOut } from '@/lib/auth/client'
import { ThemeToggle } from '@/app/theme-toggle'

const TRADE_CHIPS = ['All', 'Interior', 'Exterior', 'Cabinet', 'Drywall', 'Power wash', 'Staining']
const TRADE_TO_FILTER: Record<string, string> = {
  All: 'All Trades',
  Interior: 'Interior Painting',
  Exterior: 'Exterior Painting',
  Cabinet: 'Cabinet Painting',
  Drywall: 'Drywall Repair',
  'Power wash': 'Power Washing',
  Staining: 'Staining',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'just posted'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function useWindowWidth() {
  const [w, setW] = useState<number | undefined>()
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    h(); window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

// ─── Premium nav (matches homepage language) ──────────────────────────

function JobsNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const width = useWindowWidth()
  const isMobile = (width ?? 1024) <= 820
  const pathname = usePathname()
  const { access } = useJobsAccess()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])

  const authed = access.isAuthenticated

  return (
    <>
      <header className={`ts-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="ts-nav-inner">
          <a href="/" className="ts-nav-brand">Trade<span>Source</span></a>
          {!isMobile && (
            <nav className="ts-nav-links">
              <a href="/jobs" className={pathname?.startsWith('/jobs') ? 'is-active' : ''}>Browse jobs</a>
              {authed
                ? <a href="/dashboard">Dashboard</a>
                : <a href="/signin">Sign in</a>}
            </nav>
          )}
          <div className="ts-nav-actions">
            {!isMobile && (
              authed
                ? <button onClick={() => signOut()} className="ts-nav-cta ts-nav-cta-ghost">Sign out</button>
                : <a href="/apply" className="ts-nav-cta">Apply for access</a>
            )}
            <ThemeToggle />
            {isMobile && (
              <button onClick={() => setMobileOpen(o => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="ts-nav-hamburger">
                {mobileOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      {isMobile && mobileOpen && (
        <div className="ts-nav-drawer">
          <a href="/jobs">Browse jobs</a>
          {authed ? <a href="/dashboard">Dashboard</a> : <a href="/signin">Sign in</a>}
          {authed
            ? <button onClick={() => signOut()} className="ts-nav-drawer-cta">Sign out</button>
            : <a href="/apply" className="ts-nav-drawer-cta">Apply for access</a>}
        </div>
      )}
    </>
  )
}

// tiny context-free access reader so JobsNav can share the hook result
function useJobsAccess() {
  const access = useUserAccess()
  return { access }
}

// ─── Main ──────────────────────────────────────────────────────────────

type JobsClientProps = {
  initialJobs?: any[]
  networkContext?: { vettingNote?: string; accessNote?: string }
  isAuthenticated?: boolean
}

export default function JobsClient({ initialJobs = [], networkContext, isAuthenticated = false }: JobsClientProps) {
  const access = useUserAccess()
  const [jobs, setJobs] = useState<any[]>(initialJobs)
  const [loading, setLoading] = useState(initialJobs.length === 0)
  const [error, setError] = useState('')
  const [expressingId, setExpressingId] = useState<string | null>(null)
  const [expressedJobs, setExpressedJobs] = useState<Set<string>>(new Set())
  const [tradeChip, setTradeChip] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (initialJobs.length > 0) { setLoading(false); return }
    fetch('/api/jobs').then(r => r.ok ? r.json() : []).catch(() => [])
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : []
        const sorted = [...arr].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setJobs(sorted)
      }).finally(() => setLoading(false))
  }, [])

  const handleExpressInterest = async (jobId: string) => {
    setExpressingId(jobId); setError('')
    try {
      const contractorId = access.profile?.id ?? null
      const res = await fetch(`/api/jobs/${jobId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId }),
      })
      if (res.ok) setExpressedJobs(prev => new Set([...prev, jobId]))
      else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Failed to express interest.')
      }
    } catch { setError('Network error.') }
    finally { setExpressingId(null) }
  }

  const tradeFilter = TRADE_TO_FILTER[tradeChip] ?? 'All Trades'
  const filteredJobs = jobs.filter(job => {
    const scope = (job.scope || '').toLowerCase()
    const tradeMatch =
      tradeFilter === 'All Trades' ||
      scope.includes(tradeFilter.toLowerCase()) ||
      scope.includes(tradeChip.toLowerCase())
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const hit = (job.title || '').toLowerCase().includes(q)
        || (job.area || '').toLowerCase().includes(q)
        || (job.description || '').toLowerCase().includes(q)
      if (!hit) return false
    }
    return tradeMatch && job.status === 'open'
  })

  const openCount = filteredJobs.length

  return (
    <div className="ts-jobs">
      <JobsNav />

      {/* ─── Hero header ─── */}
      <section className="ts-jobs-hero">
        <div className="ts-jobs-hero-wash" aria-hidden="true" />
        <div className="ts-jobs-hero-inner">
          <div className="ts-hero-kicker">Phase 1 · Greater Philadelphia</div>
          <h1 className="ts-jobs-title">Open jobs.</h1>
          <p className="ts-jobs-sub">
            Fixed-price overflow painting work, shared inside a private network of vetted contractors.
          </p>
          {networkContext?.vettingNote && (
            <p className="ts-jobs-note">{networkContext.vettingNote}</p>
          )}
        </div>
      </section>

      {/* ─── Filter row ─── */}
      <div className="ts-jobs-filter">
        <div className="ts-jobs-filter-inner">
          <div className="ts-jobs-chips">
            {TRADE_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => setTradeChip(chip)}
                className={`ts-jobs-chip ${tradeChip === chip ? 'is-active' : ''}`}
              >{chip}</button>
            ))}
          </div>
          <div className="ts-jobs-filter-right">
            <div className="ts-jobs-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search title or location"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ts-jobs-count">
              <span className="ts-jobs-count-dot" />
              <span className="ts-jobs-count-num">{openCount}</span>
              <span className="ts-jobs-count-label">open</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="ts-jobs-content">
        {error && <div className="ts-jobs-error">{error}</div>}

        {loading ? (
          <div className="ts-jobs-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="ts-job-card is-skeleton">
                <div className="sk-line w-40" />
                <div className="sk-line w-70" />
                <div className="sk-line w-30" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="ts-jobs-empty">
            {jobs.length === 0 ? (
              <>
                <h3>No open jobs right now.</h3>
                <p>New work posts daily. <a href="/apply">Apply to join</a> to get notified first.</p>
              </>
            ) : (
              <>
                <h3>No matching jobs.</h3>
                <p>Try a different trade or clear your search.</p>
                <button onClick={() => { setTradeChip('All'); setSearchQuery('') }} className="ts-jobs-reset">
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="ts-jobs-grid">
            {filteredJobs.map((job, idx) => (
              <JobCard
                key={job.id}
                job={job}
                idx={idx}
                access={access}
                isAuthenticated={isAuthenticated}
                expressed={expressedJobs.has(job.id)}
                expressing={expressingId === job.id}
                onExpressInterest={() => handleExpressInterest(job.id)}
              />
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
    </div>
  )
}

// ─── Job card ─────────────────────────────────────────────────────────

function JobCard({
  job, idx, access, expressed, expressing, onExpressInterest,
}: {
  job: any
  idx: number
  access: ReturnType<typeof useUserAccess>
  isAuthenticated: boolean
  expressed: boolean
  expressing: boolean
  onExpressInterest: () => void
}) {
  const href = access.isAuthenticated ? `/jobs/${job.id}` : '/signin'

  return (
    <a
      href={href}
      className="ts-job-card"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="ts-job-card-glow" aria-hidden="true" />
      <div className="ts-job-card-body">
        <div className="ts-job-head">
          <h3 className="ts-job-title">{job.title}</h3>
          {job.budget_min != null && (
            <div className="ts-job-price">${Number(job.budget_min).toLocaleString()}</div>
          )}
        </div>

        <div className="ts-job-meta">
          {job.scope && <span className="ts-job-meta-item">{job.scope}</span>}
          {job.scope && job.area && <span className="ts-job-dot" />}
          {job.area && <span className="ts-job-meta-item">{job.area}</span>}
          <span className="ts-job-dot" />
          <span className="ts-job-meta-item">{timeAgo(job.created_at)}</span>
        </div>

        {job.description && (
          <p className="ts-job-desc">{job.description}</p>
        )}

        <div className="ts-job-foot">
          {access.canAccessContractorApp ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onExpressInterest() }}
              disabled={expressing || expressed}
              className={`ts-job-action ${expressed ? 'is-done' : ''}`}
            >
              {expressed ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Interest sent
                </>
              ) : expressing ? (
                <span className="ts-spinner" />
              ) : (
                <>
                  Express interest
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </>
              )}
            </button>
          ) : access.isAuthenticated ? (
            <span className="ts-job-action is-muted">Profile pending</span>
          ) : (
            <span className="ts-job-action is-muted">
              Sign in to express interest
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

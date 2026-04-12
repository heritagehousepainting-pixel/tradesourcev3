'use client'

import { useState, useEffect } from 'react'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { useUserAccess } from '@/lib/auth/access.client'

const US_STATES = ['PA']
const TRADES = ['All Trades', 'Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Drywall Repair', 'Power Washing', 'Staining']

const DEMO_JOBS = [] as any[]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just posted'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

// Canonical access — Supabase session drives auth state.
// access.isAuthenticated = signed in (any state)
// access.canAccessContractorApp = approved contractor or founder (can express interest)
// access.profile?.id = the contractor profile ID to pass to API routes
export default function Jobs() {
  const access = useUserAccess()
  const [jobs, setJobs] = useState<any[]>(DEMO_JOBS)
  const [availabilityPosts, setAvailabilityPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expressingId, setExpressingId] = useState<string | null>(null)
  const [expressedJobs, setExpressedJobs] = useState<Set<string>>(new Set())
  const [stateFilter, setStateFilter] = useState('All States')
  const [tradeFilter, setTradeFilter] = useState('All Trades')
  const [lastJobAt, setLastJobAt] = useState<string | null>(null)

  // Auth state is now managed by canonical useUserAccess().
  // No local useEffect auth check needed — access.isAuthenticated covers all cases.

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs').then(r => r.ok ? r.json() : Promise.reject()).catch(() => []),
      fetch('/api/reviews').then(r => r.ok ? r.json() : Promise.reject()).catch(() => ({averages: {}})),
      fetch('/api/availability').then(r => r.ok ? r.json() : Promise.reject()).catch(() => []),
    ]).then(([jobsData, reviewsData, availData]) => {
      const jobsArr = Array.isArray(jobsData) ? jobsData : []
      if (jobsArr.length > 0) {
        const sorted = [...jobsArr].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setJobs(sorted)
        setLastJobAt(sorted[0]?.created_at || null)
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
    const stateMatch = stateFilter === 'All States' || (job.area || '').includes(stateFilter)
    const tradeMatch = tradeFilter === 'All Trades' || (job.scope || '').toLowerCase().includes(tradeFilter.toLowerCase())
    return stateMatch && tradeMatch
  })

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div
        data-homepage-hero
        style={{
          backgroundColor: 'var(--color-bg-alt)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Constellation / atmospheric background texture */}
        <svg className="hero-constellation" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}><defs><filter id="ng1" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="ng2" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="ng3" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="haze" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur in="SourceGraphic" stdDeviation="28" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="haze_deep" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur in="SourceGraphic" stdDeviation="40" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="nbright" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="ng_bg"><stop offset="0%" stopColor="var(--bg, rgba(147,197,253,0.35))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="ng_md"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.55))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="ng_bright"><stop offset="0%" stopColor="var(--bl, #60A5FA)"/><stop offset="60%" stopColor="var(--nc, #3B82F6)"/><stop offset="100%" stopColor="transparent"/></radialGradient><linearGradient id="lg1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="0"/><stop offset="20%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="1"/><stop offset="80%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="1"/><stop offset="100%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="0"/></linearGradient><linearGradient id="lg2" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--ln, rgba(59,130,246,0.40))" stopOpacity="0"/><stop offset="50%" stopColor="var(--ln, rgba(59,130,246,0.40))" stopOpacity="0.8"/><stop offset="100%" stopColor="var(--ln, rgba(59,130,246,0.40))" stopOpacity="0"/></linearGradient><linearGradient id="llg1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0"/><stop offset="25%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0.6"/><stop offset="75%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0.6"/><stop offset="100%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0"/></linearGradient><linearGradient id="llg2" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--lg, rgba(59,130,246,0.30))" stopOpacity="0"/><stop offset="50%" stopColor="var(--lg, rgba(59,130,246,0.30))" stopOpacity="0.5"/><stop offset="100%" stopColor="var(--lg, rgba(59,130,246,0.30))" stopOpacity="0"/></linearGradient><radialGradient id="heroMask"><stop offset="0%" stopColor="black" stopOpacity="0"/><stop offset="40%" stopColor="black" stopOpacity="0.10"/><stop offset="58%" stopColor="black" stopOpacity="0.35"/><stop offset="75%" stopColor="black" stopOpacity="0.72"/><stop offset="100%" stopColor="black" stopOpacity="0.93"/></radialGradient><mask id="hm"><rect width="1440" height="820" fill="url(#heroMask)"/></mask><radialGradient id="cg_bl" cx="5%" cy="90%" r="55%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.48))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_tr" cx="95%" cy="10%" r="52%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.42))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_tl" cx="3%" cy="3%" r="42%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--nc, rgba(59,99,235,0.30))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_br" cx="97%" cy="92%" r="48%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.36))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_l" cx="2%" cy="50%" r="30%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--nc, rgba(59,99,235,0.20))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_c" cx="50%" cy="50%" r="38%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--nc, rgba(59,99,235,0.12))"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs><rect width="1440" height="820" fill="url(#cg_bl)" filter="url(#haze_deep)" opacity="0.92"/><rect width="1440" height="820" fill="url(#cg_tr)" filter="url(#haze_deep)" opacity="0.88"/><rect width="1440" height="820" fill="url(#cg_tl)" filter="url(#haze_deep)" opacity="0.78"/><rect width="1440" height="820" fill="url(#cg_br)" filter="url(#haze_deep)" opacity="0.82"/><rect width="1440" height="820" fill="url(#cg_l)" filter="url(#haze_deep)" opacity="0.60"/><rect width="1440" height="820" fill="url(#cg_c)" filter="url(#haze)" opacity="0.55"/><circle cx="120" cy="680" r="28" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.55"/><circle cx="1180" cy="80" r="24" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.50"/><circle cx="720" cy="120" r="20" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.45"/><circle cx="300" cy="200" r="18" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.40"/><circle cx="1100" cy="300" r="16" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.38"/><circle cx="200" cy="500" r="15" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.35"/><circle cx="1300" cy="550" r="17" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.38"/><circle cx="900" cy="680" r="20" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.42"/><circle cx="600" cy="750" r="14" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.32"/><circle cx="80" cy="350" r="12" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.30"/><line x1="120" y1="680" x2="300" y2="200" stroke="url(#lg2)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.28"/><line x1="300" y1="200" x2="720" y2="120" stroke="url(#lg2)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.24"/><line x1="720" y1="120" x2="1180" y2="80" stroke="url(#lg2)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.24"/><line x1="120" y1="680" x2="200" y2="500" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.22"/><line x1="200" y1="500" x2="80" y2="350" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.22"/><line x1="720" y1="120" x2="900" y2="680" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="1100" y1="300" x2="1300" y2="550" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="1300" y1="550" x2="900" y2="680" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.22"/><line x1="300" y1="200" x2="1100" y2="300" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="900" y1="680" x2="600" y2="750" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="420" y1="340" x2="820" y2="480" stroke="url(#llg1)" strokeWidth="8" filter="url(#ng2)" opacity="0.28"/><line x1="420" y1="340" x2="600" y2="180" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="820" y1="480" x2="700" y2="580" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="820" y1="480" x2="1100" y2="480" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="420" y1="340" x2="280" y2="620" stroke="url(#llg2)" strokeWidth="6" filter="url(#ng2)" opacity="0.20"/><line x1="420" y1="340" x2="160" y2="280" stroke="url(#llg2)" strokeWidth="6" filter="url(#ng2)" opacity="0.18"/><line x1="600" y1="180" x2="1020" y2="200" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="820" y1="480" x2="960" y2="620" stroke="url(#llg2)" strokeWidth="6" filter="url(#ng2)" opacity="0.18"/><line x1="280" y1="620" x2="480" y2="700" stroke="url(#llg1)" strokeWidth="5" filter="url(#ng2)" opacity="0.18"/><line x1="1100" y1="480" x2="1340" y2="380" stroke="url(#llg2)" strokeWidth="5" filter="url(#ng2)" opacity="0.18"/><circle cx="420" cy="340" r="18" fill="url(#ng_md)" filter="url(#ng2)" opacity="0.70"/><circle cx="820" cy="480" r="16" fill="url(#ng_md)" filter="url(#ng2)" opacity="0.65"/><circle cx="600" cy="180" r="14" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.62"/><circle cx="1020" cy="200" r="15" fill="url(#ng_md)" filter="url(#ng2)" opacity="0.62"/><circle cx="280" cy="620" r="13" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.58"/><circle cx="700" cy="580" r="14" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.60"/><circle cx="1100" cy="480" r="13" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.58"/><circle cx="160" cy="280" r="12" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.55"/><circle cx="480" cy="700" r="11" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.52"/><circle cx="960" cy="620" r="11" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.52"/><circle cx="1340" cy="380" r="12" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.55"/><circle cx="1180" cy="180" r="10" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.50"/><circle cx="680" cy="420" r="9" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.48"/><circle cx="380" cy="520" r="8" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.45"/><line x1="420" y1="340" x2="600" y2="180" stroke="url(#lg1)" strokeWidth="1.0" filter="url(#ng1)" opacity="0.50"/><line x1="420" y1="340" x2="280" y2="620" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="420" y1="340" x2="160" y2="280" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="600" y1="180" x2="1020" y2="200" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="820" y1="480" x2="700" y2="580" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="820" y1="480" x2="1100" y2="480" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="820" y1="480" x2="960" y2="620" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="280" y1="620" x2="480" y2="700" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="1100" y1="480" x2="1340" y2="380" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="960" y1="620" x2="700" y2="580" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="420" y1="340" x2="820" y2="480" stroke="url(#lg1)" strokeWidth="1.1" filter="url(#ng1)" opacity="0.52"/><line x1="600" y1="180" x2="420" y2="340" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="1180" y1="180" x2="1020" y2="200" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="420" y1="340" x2="680" y2="420" stroke="url(#lg1)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.38"/><line x1="820" y1="480" x2="680" y2="420" stroke="url(#lg1)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.38"/><line x1="680" y1="420" x2="380" y2="520" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.34"/><line x1="680" y1="420" x2="1100" y2="480" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.34"/><line x1="380" y1="520" x2="280" y2="620" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.32"/><line x1="700" y1="580" x2="480" y2="700" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.32"/><circle cx="420" cy="340" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.92"/><circle cx="820" cy="480" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.92"/><circle cx="600" cy="180" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="1020" cy="200" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="280" cy="620" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="700" cy="580" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1100" cy="480" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="480" cy="700" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="960" cy="620" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="1340" cy="380" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1180" cy="180" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="160" cy="280" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="120" cy="680" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="1180" cy="80" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="900" cy="680" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="300" cy="200" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1300" cy="550" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1100" cy="300" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="600" cy="750" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.78"/><circle cx="680" cy="420" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.78"/><circle cx="380" cy="520" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.75"/><circle cx="420" cy="340" r="2" fill="#BFDBFE" opacity="0.95"/><circle cx="820" cy="480" r="2" fill="#BFDBFE" opacity="0.95"/><circle cx="120" cy="680" r="2" fill="#BFDBFE" opacity="0.90"/><circle cx="1180" cy="80" r="2" fill="#BFDBFE" opacity="0.90"/><circle cx="600" cy="180" r="1.5" fill="#DBEAFE" opacity="0.92"/><circle cx="1020" cy="200" r="1.5" fill="#DBEAFE" opacity="0.92"/><circle cx="280" cy="620" r="1.5" fill="#DBEAFE" opacity="0.88"/><circle cx="1100" cy="480" r="1.5" fill="#DBEAFE" opacity="0.88"/><circle cx="200" cy="100" r="1.5" fill="#93C5FD" opacity="0.35"/><circle cx="500" cy="300" r="1" fill="#93C5FD" opacity="0.30"/><circle cx="800" cy="250" r="1.5" fill="#93C5FD" opacity="0.32"/><circle cx="1150" cy="420" r="1" fill="#93C5FD" opacity="0.28"/><circle cx="350" cy="450" r="1" fill="#93C5FD" opacity="0.28"/><circle cx="950" cy="350" r="1.5" fill="#93C5FD" opacity="0.30"/><circle cx="750" cy="600" r="1" fill="#93C5FD" opacity="0.25"/><circle cx="150" cy="600" r="1.5" fill="#93C5FD" opacity="0.28"/><circle cx="1200" cy="620" r="1" fill="#93C5FD" opacity="0.25"/><circle cx="550" cy="480" r="1" fill="#93C5FD" opacity="0.22"/><circle cx="300" cy="150" r="1" fill="#93C5FD" opacity="0.22"/><circle cx="1000" cy="550" r="1.5" fill="#93C5FD" opacity="0.28"/><circle cx="450" cy="600" r="1" fill="#93C5FD" opacity="0.20"/><circle cx="1050" cy="120" r="1" fill="#93C5FD" opacity="0.20"/><circle cx="650" cy="100" r="1" fill="#93C5FD" opacity="0.18"/><circle cx="850" cy="150" r="1" fill="#93C5FD" opacity="0.18"/><circle cx="250" cy="380" r="1" fill="#93C5FD" opacity="0.20"/><circle cx="580" cy="650" r="1" fill="#93C5FD" opacity="0.18"/><circle cx="1100" cy="680" r="1.5" fill="#93C5FD" opacity="0.25"/><rect width="1440" height="820" fill="url(#heroMask)" mask="url(#hm)" opacity="1"/></svg>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 48px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
            Open Jobs
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Fixed-price painting work across the TradeSource private network.
            {jobs.length === 0 && (
              <span style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
                New network — jobs posted regularly as contractors join.{' '}
                <a href="/apply" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}>Apply to join</a>
                {' '}to get early access.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 60, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 12, height: 56, flexWrap: 'wrap' }}>
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-input-border)', color: 'var(--color-input-text)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}
          >
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={tradeFilter}
            onChange={e => setTradeFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-input-border)', color: 'var(--color-input-text)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}
          >
            {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(stateFilter !== 'All States' || tradeFilter !== 'All Trades') && (
            <button
              onClick={() => { setStateFilter('All States'); setTradeFilter('All Trades') }}
              style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
            >
              Clear filters
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Availability — compact strip */}
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
                <div key={post.id} style={{ padding: '16px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
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
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            {jobs.length === 0 ? (
              /* Network is empty — honest early-network state */
              <>
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                  No jobs posted yet
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.65 }}>
                  TradeSource is a private network still in its early phase. As more contractors join, jobs will be posted here regularly. Check back soon — or{' '}
                  <a href="/apply" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}>apply to join</a>
                  {' '}to be first when work goes live.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/apply" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                    Apply to Join
                  </a>
                  <a href="/" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid var(--color-border)' }}>
                    Back to Home
                  </a>
                </div>
              </>
            ) : (
              /* Filters active but nothing matches */
              <>
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                  No jobs match your filters
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  Try clearing your filters or check back soon.
                </p>
                <button
                  onClick={() => { setStateFilter('All States'); setTradeFilter('All Trades') }}
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredJobs.map(job => (
              <div key={job.id} style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '24px', boxShadow: '0 2px 12px var(--color-shadow)' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{job.title}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                        Open
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Network posting</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {job.budget_min && (
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-green)', letterSpacing: '-0.02em' }}>
                        ${job.budget_min.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 16 }}>
                  {job.description}
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  {job.area && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{job.area}</span>
                    </div>
                  )}
                  {job.scope && (
                    <span className="badge-scope" style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, backgroundColor: 'var(--color-blue-soft)', color: 'var(--color-blue)', border: '1px solid var(--color-blue)' }}>
                      {job.scope}
                    </span>
                  )}
                  {job.created_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
                      {(() => {
                        const diff = Date.now() - new Date(job.created_at).getTime()
                        const hours = Math.floor(diff / 3600000)
                        if (hours < 24) return <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                        return null
                      })()}
                      <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{timeAgo(job.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* CTA row */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
                  <a
                    href={access.isAuthenticated ? `/jobs/${job.id}` : '/founder-login'}
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text)', border: '1px solid var(--color-border)', textDecoration: 'none', minHeight: 44 }}
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
                    <span
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
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      Profile pending
                    </span>
                  ) : (
                    <a
                      href="/founder-login"
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
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                        textDecoration: 'none',
                      }}
                    >
                      Sign in to express interest
                    </a>
                  )}
                </div>
                {!access.isAuthenticated && (
                  <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 8 }}>
                    Sign in to contact contractors and express interest in this work.
                  </p>
                )}
                {access.isAuthenticated && expressedJobs.has(job.id) && (
                  <p style={{ fontSize: 11, color: 'var(--color-green)', marginTop: 8 }}>
                    The job poster will review your interest and reach out if selected.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <FloatingAssistant
        route="/browse"
        pageTitle="Browse Jobs"
        pageDescription="Contractor job listing page showing available overflow jobs"
        pageStateSummary={`Browse view — ${access.isAuthenticated ? 'authenticated contractor' : 'public preview (read-only)'}`}
        userRole="contractor"
        isLoggedIn={access.isAuthenticated}
      />
    </>
  )
}

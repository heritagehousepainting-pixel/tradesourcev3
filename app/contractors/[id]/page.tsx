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
      <div className="min-h-screen" data-homepage-hero style={{ backgroundColor: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
        <svg className="hero-constellation" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}><defs><filter id="ng1" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="ng2" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="ng3" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="haze" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur in="SourceGraphic" stdDeviation="28" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="haze_deep" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur in="SourceGraphic" stdDeviation="40" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="nbright" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="ng_bg"><stop offset="0%" stopColor="var(--bg, rgba(147,197,253,0.35))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="ng_md"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.55))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="ng_bright"><stop offset="0%" stopColor="var(--bl, #60A5FA)"/><stop offset="60%" stopColor="var(--nc, #3B82F6)"/><stop offset="100%" stopColor="transparent"/></radialGradient><linearGradient id="lg1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="0"/><stop offset="20%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="1"/><stop offset="80%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="1"/><stop offset="100%" stopColor="var(--ln, rgba(37,99,235,0.50))" stopOpacity="0"/></linearGradient><linearGradient id="lg2" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--ln, rgba(59,130,246,0.40))" stopOpacity="0"/><stop offset="50%" stopColor="var(--ln, rgba(59,130,246,0.40))" stopOpacity="0.8"/><stop offset="100%" stopColor="var(--ln, rgba(59,130,246,0.40))" stopOpacity="0"/></linearGradient><linearGradient id="llg1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0"/><stop offset="25%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0.6"/><stop offset="75%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0.6"/><stop offset="100%" stopColor="var(--lg, rgba(59,130,246,0.35))" stopOpacity="0"/></linearGradient><linearGradient id="llg2" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--lg, rgba(59,130,246,0.30))" stopOpacity="0"/><stop offset="50%" stopColor="var(--lg, rgba(59,130,246,0.30))" stopOpacity="0.5"/><stop offset="100%" stopColor="var(--lg, rgba(59,130,246,0.30))" stopOpacity="0"/></linearGradient><radialGradient id="heroMask"><stop offset="0%" stopColor="black" stopOpacity="0"/><stop offset="40%" stopColor="black" stopOpacity="0.10"/><stop offset="58%" stopColor="black" stopOpacity="0.35"/><stop offset="75%" stopColor="black" stopOpacity="0.72"/><stop offset="100%" stopColor="black" stopOpacity="0.93"/></radialGradient><mask id="hm"><rect width="1440" height="820" fill="url(#heroMask)"/></mask><radialGradient id="cg_bl" cx="5%" cy="90%" r="55%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.48))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_tr" cx="95%" cy="10%" r="52%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.42))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_tl" cx="3%" cy="3%" r="42%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--nc, rgba(59,99,235,0.30))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_br" cx="97%" cy="92%" r="48%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--ng, rgba(59,130,246,0.36))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_l" cx="2%" cy="50%" r="30%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--nc, rgba(59,99,235,0.20))"/><stop offset="100%" stopColor="transparent"/></radialGradient><radialGradient id="cg_c" cx="50%" cy="50%" r="38%" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--nc, rgba(59,99,235,0.12))"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs><rect width="1440" height="820" fill="url(#cg_bl)" filter="url(#haze_deep)" opacity="0.92"/><rect width="1440" height="820" fill="url(#cg_tr)" filter="url(#haze_deep)" opacity="0.88"/><rect width="1440" height="820" fill="url(#cg_tl)" filter="url(#haze_deep)" opacity="0.78"/><rect width="1440" height="820" fill="url(#cg_br)" filter="url(#haze_deep)" opacity="0.82"/><rect width="1440" height="820" fill="url(#cg_l)" filter="url(#haze_deep)" opacity="0.60"/><rect width="1440" height="820" fill="url(#cg_c)" filter="url(#haze)" opacity="0.55"/><circle cx="120" cy="680" r="28" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.55"/><circle cx="1180" cy="80" r="24" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.50"/><circle cx="720" cy="120" r="20" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.45"/><circle cx="300" cy="200" r="18" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.40"/><circle cx="1100" cy="300" r="16" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.38"/><circle cx="200" cy="500" r="15" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.35"/><circle cx="1300" cy="550" r="17" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.38"/><circle cx="900" cy="680" r="20" fill="url(#ng_bg)" filter="url(#ng3)" opacity="0.42"/><circle cx="600" cy="750" r="14" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.32"/><circle cx="80" cy="350" r="12" fill="url(#ng_bg)" filter="url(#ng2)" opacity="0.30"/><line x1="120" y1="680" x2="300" y2="200" stroke="url(#lg2)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.28"/><line x1="300" y1="200" x2="720" y2="120" stroke="url(#lg2)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.24"/><line x1="720" y1="120" x2="1180" y2="80" stroke="url(#lg2)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.24"/><line x1="120" y1="680" x2="200" y2="500" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.22"/><line x1="200" y1="500" x2="80" y2="350" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.22"/><line x1="720" y1="120" x2="900" y2="680" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="1100" y1="300" x2="1300" y2="550" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="1300" y1="550" x2="900" y2="680" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.22"/><line x1="300" y1="200" x2="1100" y2="300" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="900" y1="680" x2="600" y2="750" stroke="url(#lg2)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.20"/><line x1="420" y1="340" x2="820" y2="480" stroke="url(#llg1)" strokeWidth="8" filter="url(#ng2)" opacity="0.28"/><line x1="420" y1="340" x2="600" y2="180" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="820" y1="480" x2="700" y2="580" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="820" y1="480" x2="1100" y2="480" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="420" y1="340" x2="280" y2="620" stroke="url(#llg2)" strokeWidth="6" filter="url(#ng2)" opacity="0.20"/><line x1="420" y1="340" x2="160" y2="280" stroke="url(#llg2)" strokeWidth="6" filter="url(#ng2)" opacity="0.18"/><line x1="600" y1="180" x2="1020" y2="200" stroke="url(#llg1)" strokeWidth="7" filter="url(#ng2)" opacity="0.24"/><line x1="820" y1="480" x2="960" y2="620" stroke="url(#llg2)" strokeWidth="6" filter="url(#ng2)" opacity="0.18"/><line x1="280" y1="620" x2="480" y2="700" stroke="url(#llg1)" strokeWidth="5" filter="url(#ng2)" opacity="0.18"/><line x1="1100" y1="480" x2="1340" y2="380" stroke="url(#llg2)" strokeWidth="5" filter="url(#ng2)" opacity="0.18"/><circle cx="420" cy="340" r="18" fill="url(#ng_md)" filter="url(#ng2)" opacity="0.70"/><circle cx="820" cy="480" r="16" fill="url(#ng_md)" filter="url(#ng2)" opacity="0.65"/><circle cx="600" cy="180" r="14" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.62"/><circle cx="1020" cy="200" r="15" fill="url(#ng_md)" filter="url(#ng2)" opacity="0.62"/><circle cx="280" cy="620" r="13" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.58"/><circle cx="700" cy="580" r="14" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.60"/><circle cx="1100" cy="480" r="13" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.58"/><circle cx="160" cy="280" r="12" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.55"/><circle cx="480" cy="700" r="11" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.52"/><circle cx="960" cy="620" r="11" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.52"/><circle cx="1340" cy="380" r="12" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.55"/><circle cx="1180" cy="180" r="10" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.50"/><circle cx="680" cy="420" r="9" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.48"/><circle cx="380" cy="520" r="8" fill="url(#ng_md)" filter="url(#ng1)" opacity="0.45"/><line x1="420" y1="340" x2="600" y2="180" stroke="url(#lg1)" strokeWidth="1.0" filter="url(#ng1)" opacity="0.50"/><line x1="420" y1="340" x2="280" y2="620" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="420" y1="340" x2="160" y2="280" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="600" y1="180" x2="1020" y2="200" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="820" y1="480" x2="700" y2="580" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="820" y1="480" x2="1100" y2="480" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="820" y1="480" x2="960" y2="620" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="280" y1="620" x2="480" y2="700" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="1100" y1="480" x2="1340" y2="380" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="960" y1="620" x2="700" y2="580" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="420" y1="340" x2="820" y2="480" stroke="url(#lg1)" strokeWidth="1.1" filter="url(#ng1)" opacity="0.52"/><line x1="600" y1="180" x2="420" y2="340" stroke="url(#lg1)" strokeWidth="0.9" filter="url(#ng1)" opacity="0.46"/><line x1="1180" y1="180" x2="1020" y2="200" stroke="url(#lg1)" strokeWidth="0.8" filter="url(#ng1)" opacity="0.42"/><line x1="420" y1="340" x2="680" y2="420" stroke="url(#lg1)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.38"/><line x1="820" y1="480" x2="680" y2="420" stroke="url(#lg1)" strokeWidth="0.7" filter="url(#ng1)" opacity="0.38"/><line x1="680" y1="420" x2="380" y2="520" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.34"/><line x1="680" y1="420" x2="1100" y2="480" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.34"/><line x1="380" y1="520" x2="280" y2="620" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.32"/><line x1="700" y1="580" x2="480" y2="700" stroke="url(#lg1)" strokeWidth="0.6" filter="url(#ng1)" opacity="0.32"/><circle cx="420" cy="340" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.92"/><circle cx="820" cy="480" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.92"/><circle cx="600" cy="180" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="1020" cy="200" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="280" cy="620" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="700" cy="580" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1100" cy="480" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="480" cy="700" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="960" cy="620" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="1340" cy="380" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1180" cy="180" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="160" cy="280" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="120" cy="680" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="1180" cy="80" r="5" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.88"/><circle cx="900" cy="680" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="300" cy="200" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1300" cy="550" r="4" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.85"/><circle cx="1100" cy="300" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.80"/><circle cx="600" cy="750" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.78"/><circle cx="680" cy="420" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.78"/><circle cx="380" cy="520" r="3" fill="url(#ng_bright)" filter="url(#nbright)" opacity="0.75"/><circle cx="420" cy="340" r="2" fill="#BFDBFE" opacity="0.95"/><circle cx="820" cy="480" r="2" fill="#BFDBFE" opacity="0.95"/><circle cx="120" cy="680" r="2" fill="#BFDBFE" opacity="0.90"/><circle cx="1180" cy="80" r="2" fill="#BFDBFE" opacity="0.90"/><circle cx="600" cy="180" r="1.5" fill="#DBEAFE" opacity="0.92"/><circle cx="1020" cy="200" r="1.5" fill="#DBEAFE" opacity="0.92"/><circle cx="280" cy="620" r="1.5" fill="#DBEAFE" opacity="0.88"/><circle cx="1100" cy="480" r="1.5" fill="#DBEAFE" opacity="0.88"/><circle cx="200" cy="100" r="1.5" fill="#93C5FD" opacity="0.35"/><circle cx="500" cy="300" r="1" fill="#93C5FD" opacity="0.30"/><circle cx="800" cy="250" r="1.5" fill="#93C5FD" opacity="0.32"/><circle cx="1150" cy="420" r="1" fill="#93C5FD" opacity="0.28"/><circle cx="350" cy="450" r="1" fill="#93C5FD" opacity="0.28"/><circle cx="950" cy="350" r="1.5" fill="#93C5FD" opacity="0.30"/><circle cx="750" cy="600" r="1" fill="#93C5FD" opacity="0.25"/><circle cx="150" cy="600" r="1.5" fill="#93C5FD" opacity="0.28"/><circle cx="1200" cy="620" r="1" fill="#93C5FD" opacity="0.25"/><circle cx="550" cy="480" r="1" fill="#93C5FD" opacity="0.22"/><circle cx="300" cy="150" r="1" fill="#93C5FD" opacity="0.22"/><circle cx="1000" cy="550" r="1.5" fill="#93C5FD" opacity="0.28"/><circle cx="450" cy="600" r="1" fill="#93C5FD" opacity="0.20"/><circle cx="1050" cy="120" r="1" fill="#93C5FD" opacity="0.20"/><circle cx="650" cy="100" r="1" fill="#93C5FD" opacity="0.18"/><circle cx="850" cy="150" r="1" fill="#93C5FD" opacity="0.18"/><circle cx="250" cy="380" r="1" fill="#93C5FD" opacity="0.20"/><circle cx="580" cy="650" r="1" fill="#93C5FD" opacity="0.18"/><circle cx="1100" cy="680" r="1.5" fill="#93C5FD" opacity="0.25"/><rect width="1440" height="820" fill="url(#heroMask)" mask="url(#hm)" opacity="1"/></svg>
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
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 400, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Contractor not found</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>
            TradeSource is a private contractor network. Profiles are only visible to approved members.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <a href="/apply" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Apply to Join</a>
            <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid var(--color-border)' }}>Browse Jobs</a>
          </div>
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

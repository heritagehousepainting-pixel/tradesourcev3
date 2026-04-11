'use client'

import { useState, useEffect } from 'react'
import { useNavContext } from '@/app/components/NavContext'

type Job = {
  id: string
  title: string
  area: string | null
  budget_min: number | null
  budget_max: number | null
  status: string
  created_at: string
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

function HomepageNav() {
  const { access } = useNavContext()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      backgroundColor: scrolled ? 'rgba(13,27,42,0.85)' : 'rgba(13,27,42,0.95)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}`,
      transition: 'background-color 0.2s, border-color 0.2s',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--color-text)', lineHeight: 1 }}>
            TradeSource
          </span>
        </a>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/jobs" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
            Browse Jobs
          </a>
          {access.isAuthenticated ? (
            <a href="/dashboard" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>
              Dashboard
            </a>
          ) : (
            <a href="/apply" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>
              Apply
            </a>
          )}
          {!access.isAuthenticated && (
            <a href="/founder-login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>
              Sign In
            </a>
          )}
          <a href="/apply" style={{ fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 8, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', letterSpacing: '0.01em' }}>
            Apply to Join
          </a>
        </nav>
      </div>
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const counties = ['Montgomery County', 'Bucks County', 'Delaware County', 'Philadelphia County']
  return (
    <footer style={{ backgroundColor: 'var(--color-bg-primary)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '56px 32px 32px' }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--color-text)' }}>TradeSource</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 260 }}>
              A private contractor network built for painters. Route overflow work to vetted contractors in your area.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Product</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/jobs', label: 'Browse Jobs' },
                { href: '/apply', label: 'Apply to Join' },
                { href: '/post-job', label: 'Post Overflow Work' },
                { href: '/founder-login', label: 'Sign In' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Company</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/terms', label: 'Terms of Service' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
            © {new Date().getFullYear()} TradeSource. All rights reserved.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {counties.map(c => (
              <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD' }}>
                {c}, PA
              </span>
            ))}
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--color-green)' }}>
              Painting only
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Early Access Form ─────────────────────────────────────────────────────────

function EarlyAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', county: '', work_type: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.county || !form.work_type) {
      setError('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSubmitted(true)
      else setError('Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: '28px 32px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-green)', marginBottom: 8 }}>You're on the list.</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>We'll be in touch when the network opens in your area.</p>
      </div>
    )
  }

  const inputBase = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
    border: '1.5px solid var(--color-border-md)', backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text)', outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box' as const,
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Full name" style={inputBase}
          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border-md)'} />
        <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email address" style={inputBase}
          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border-md)'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <select value={form.county} onChange={e => update('county', e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border-md)'}>
          <option value="">Select county</option>
          <option>Montgomery County, PA</option>
          <option>Bucks County, PA</option>
          <option>Delaware County, PA</option>
          <option>Philadelphia County, PA</option>
        </select>
        <input type="text" value={form.work_type} onChange={e => update('work_type', e.target.value)} placeholder="Type of work" style={inputBase}
          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border-md)'} />
      </div>
      {error && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-red)' }}>{error}</div>}
      <button type="submit" disabled={submitting} style={{ width: '100%', padding: '15px', borderRadius: 10, fontSize: 15, fontWeight: 700, backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none', cursor: submitting ? 'default' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 14px rgba(37,99,235,0.3)', letterSpacing: '0.01em', opacity: submitting ? 0.7 : 1, transition: 'all 0.15s' }}>
        {submitting ? 'Submitting…' : 'Request Early Access →'}
      </button>
    </form>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoaded, setJobsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => {
        const openJobs = (Array.isArray(data) ? data : [])
          .filter((j: Job) => j.status === 'open')
          .slice(0, 3)
        setJobs(openJobs)
        setJobsLoaded(true)
      })
      .catch(() => setJobsLoaded(true))
  }, [])

  const openJobCount = jobs.length

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>

      {/* ─── NAV ─── */}
      <HomepageNav />

      {/* ─── 1. PRE-HEADING STRIP ─── */}
      <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '10px 32px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Phase 1 — Serving Montgomery County, Bucks County, Delaware County, and Philadelphia, PA · Painting services only
          </span>
        </div>
      </div>

      {/* ─── 2. HERO — Split Panel ─── */}
      <section style={{ background: 'linear-gradient(to bottom, var(--color-bg-secondary), var(--color-bg-primary))', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 32px 64px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 56, alignItems: 'center' }}>

          {/* Left */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Phase 1 — Philadelphia Area
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.035em', lineHeight: 1.05, maxWidth: 580, marginBottom: 24 }}>
              Finding reliable labor shouldn't require a miracle. Here's the network that changes it.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>
              A private network of vetted painting contractors in the four-county Philadelphia area. Post your work at your rate. Choose who you send it to.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', letterSpacing: '0.01em' }}>
                Apply to Join
              </a>
              <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, padding: '14px 28px', borderRadius: 10, backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border-md)', textDecoration: 'none' }}>
                See Open Jobs →
              </a>
            </div>
          </div>

          {/* Right — Stats panel */}
          <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-md)', borderRadius: 16, padding: '32px 32px', minWidth: 240, boxShadow: '0 12px 60px var(--color-shadow-lg)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Network at a glance</p>
            {[
              { n: '4', label: 'Counties' },
              { n: '5', label: 'Vetting Checks' },
              { n: '0', label: 'Lead Fees' },
              { n: '100%', label: 'Vetted Network' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>{stat.n}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
            {openJobCount > 0 && (
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-green)' }}>{openJobCount} Open Job{openJobCount !== 1 ? 's' : ''}</span>
                </div>
                <a href="/jobs" style={{ fontSize: 12, color: 'var(--color-blue)', textDecoration: 'none', fontWeight: 600 }}>View all jobs →</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3. CENTERED TICKER STRIP ─── */}
      <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
            {[
              'Verified',
              'PA Contractor License',
              'Insurance on File',
              'W-9 Verified',
              'Experience Checked',
              'External Review Required',
              'Phase 1 — Painting',
            ].map((item, i) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRight: i < 6 ? '1px solid var(--color-border)' : 'none' }}>
                {i === 0 ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item}</span>
                ) : (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item}</span>
                    <span style={{ fontSize: 8, color: 'var(--color-green)', lineHeight: 1 }}>●</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. PROBLEM / SOLUTION — Two-column split ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 32px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 48 }}>
            The way contractors find subs right now is broken.
          </h2>

          <div style={{
            border: '1px solid var(--color-border)', borderRadius: 20, overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
          }}>
            {/* Left pane — How it works today */}
            <div style={{ padding: '48px 48px', backgroundColor: 'var(--color-bg-card)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
                How it works today
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Facebook Marketplace',
                  'Craigslist',
                  'A Google search',
                  'Business cards from the paint store',
                  'A referral from someone who knows someone',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 14, color: '#f87171', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>—</span>
                    <span style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  You don't know who you're calling. You don't know if they show up. You don't know if they do good work. And if you pick wrong, you lose the job, lose the customer, or both.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ backgroundColor: 'var(--color-border)' }} />

            {/* Right pane — How TradeSource works */}
            <div style={{ padding: '48px 48px', backgroundColor: 'var(--color-bg-card)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
                How it works on TradeSource
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Every contractor vetted before joining',
                  'Fixed rate — no one undercuts your price',
                  'You choose who gets the job',
                  'Work stays private between contractors',
                  'No lead fees, no ads, no chasing leads',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'var(--color-green-dim)', border: '1px solid var(--color-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.7 }}>
                  No contractor should have to trust their business to a random Google search.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. WHAT TRADESOURCE IS ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-primary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 32px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 20 }}>
            A vetted network. Fixed rates. No guessing.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: 24 }}>
            TradeSource is a private contractor network built around one mechanism: you post a job at your rate, vetted contractors in the network see it and respond, and you choose who you send it to.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'No bidding.', body: 'No one undercuts your price to get the job.' },
              { label: 'No lead fees.', body: "You're not paying for a list of maybe-interested contractors." },
              { label: 'No wondering.', body: 'The person who shows up actually does the work.' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: 'var(--color-green-dim)', border: '1px solid var(--color-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{item.label}</strong> {item.body}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            Every contractor in the network is verified before they get access — license, insurance, W-9, experience, and at least one real customer review.
          </p>
        </div>
      </section>

      {/* ─── 6. WHO IT'S FOR — Three Cards with ghost numbers ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Network</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>
            Built for three types of contractors.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                num: '01',
                tag: 'Overflow Route',
                title: 'Contractors with more work than their crew can handle.',
                body: "You landed the job. You need reliable help to finish it without hiring someone full-time. Post the work at your rate, connect with a vetted sub in the network, keep the customer, move on to the next job.",
              },
              {
                num: '02',
                tag: 'Finding Work',
                title: 'Subcontractors who do good work but can\'t find enough of it.',
                body: "You're solid. You show up. You do the job right. But consistent work isn't guaranteed — you're always chasing the next gig. TradeSource puts you inside a network of contractors who need exactly what you offer.",
              },
              {
                num: '03',
                tag: 'Next-Gen',
                title: 'Next-generation operators who sell without building a crew.',
                body: "You can close a job. You don't want to manage a crew. TradeSource lets you post the work, find the right sub, and fulfill what you sold — without the overhead.",
              },
            ].map((card) => (
              <div key={card.num} style={{
                padding: '28px 28px 32px',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                boxShadow: '0 8px 32px var(--color-shadow)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-blue-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                {/* Ghost number watermark */}
                <div style={{
                  position: 'absolute', top: -10, right: 16,
                  fontSize: 120, fontWeight: 900, lineHeight: 1,
                  color: 'var(--color-bg-elevated)',
                  WebkitTextStroke: '1px rgba(59,130,246,0.12)',
                  userSelect: 'none', pointerEvents: 'none',
                }}>
                  {card.num}
                </div>
                {/* Tag */}
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  {card.tag}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.4, position: 'relative' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7, position: 'relative' }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. HOW IT WORKS — Ghost number list ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-primary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 32px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 48 }}>
            How TradeSource works.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { n: '01', title: 'Apply', body: "Submit your basic business information, contractor license, proof of insurance, W-9, experience, and at least one link to your work." },
              { n: '02', title: 'We review your application', body: "Every application is reviewed personally. We verify your documents and check that everything is legitimate before you get access." },
              { n: '03', title: 'Get approved and access the network', body: "Once approved, you receive an email and create your password. You get full access to the network of vetted painting contractors." },
              { n: '04', title: 'Post overflow work at your rate', body: "When you have work that needs a sub, post it at a fixed price. Describe the scope, set the timeline, and post. Contractors in the network see it and respond." },
              { n: '05', title: 'Choose who you want to work with', body: "Review profiles, see experience and past work. You decide who gets the job — no algorithm, no bidding, no surprises." },
            ].map((step, i) => (
              <div key={step.n} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr', gap: 32, alignItems: 'start',
                padding: '28px 0', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none',
              }}>
                {/* Ghost number */}
                <div style={{
                  fontSize: 56, fontWeight: 900, lineHeight: 1,
                  color: 'var(--color-bg-elevated)',
                  WebkitTextStroke: '1px rgba(59,130,246,0.2)',
                  letterSpacing: '-0.04em', paddingTop: 4,
                }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. HOW WE VET — 2-column grid ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 32px' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Vetting</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            How We Vet Every Contractor in the Network
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 40 }}>
            Every contractor is verified before they get access. Here is exactly what we check:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { label: 'Valid PA Contractor License', body: 'We verify your license number against Pennsylvania state records before you get access.' },
              { label: 'Proof of Insurance', body: 'We require a current certificate of insurance. No insurance, no exceptions.' },
              { label: 'W-9 Tax Documentation', body: 'We collect a W-9 to confirm your business identity and tax information.' },
              { label: 'Trade Experience Verification', body: "We verify that you have documented experience in your trade — not just a license, but actual work history." },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px',
                backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 12, transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-green-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--color-green-dim)', border: '1px solid var(--color-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Full-width item 5 */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px',
            backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: 12, marginTop: 20, transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-green-border)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--color-green-dim)', border: '1px solid var(--color-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>At Least One External Review</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>We confirm at least one review from a real customer or trade reference — a Google Business Profile, Houzz, Angi, or equivalent.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. EARLY ACCESS CTA ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-primary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Ready to stop trusting your business to{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--color-blue)' }}>random Google searches?</em>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 40 }}>
            TradeSource is opening to a limited number of contractors in Montgomery County, Bucks County, Delaware County, and Philadelphia, PA. Request access and we'll notify you when the network opens in your area.
          </p>
          <EarlyAccessForm />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  )
}

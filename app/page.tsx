'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/app/theme-toggle'
import { trackClick } from '@/lib/analytics'

// ─── Shared responsive hook ────────────────────────────────────────────────────────────────

function useWindowWidth() {
  const [width, setWidth] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handle = () => setWidth(window.innerWidth)
    handle()
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])
  return width
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

function HomepageNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const width = useWindowWidth()
  const isMobile = (width ?? 1024) <= 640
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'var(--color-bg-primary)' : 'var(--color-bg-primary)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: '1px solid var(--color-border)',
        padding: isMobile ? '0 16px' : '0 56px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{
          fontSize: 18, fontWeight: 800, color: 'var(--color-text)',
          textDecoration: 'none', letterSpacing: '-0.3px',
        }}>
          Trade<span style={{ color: 'var(--color-blue)' }}>Source</span>
        </a>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="/jobs" style={{
              color: 'var(--color-text-muted)', textDecoration: 'none',
              fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
              paddingBottom: 2,
              borderBottom: pathname?.startsWith('/jobs') ? '2px solid var(--color-blue)' : '2px solid transparent',
              marginBottom: -2,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = pathname?.startsWith('/jobs') ? 'var(--color-blue)' : 'var(--color-text-muted)')}>
              Browse Jobs
            </a>
            <a href="/apply" style={{
              color: 'var(--color-text-muted)', textDecoration: 'none',
              fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
              paddingBottom: 2,
              borderBottom: pathname?.startsWith('/apply') ? '2px solid var(--color-blue)' : '2px solid transparent',
              marginBottom: -2,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = pathname?.startsWith('/apply') ? 'var(--color-blue)' : 'var(--color-text-muted)')}>
              Apply
            </a>
            <a href="/founder-login" style={{
              color: 'var(--color-text-muted)', textDecoration: 'none',
              fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              Sign In
            </a>
            <a href="/apply" style={{
              background: 'var(--color-blue)', color: '#fff',
              padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-blue-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-blue)')}>
              Apply for Access
            </a>
            <ThemeToggle />
          </div>
        )}

        {/* Mobile: theme toggle + hamburger */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text)', borderRadius: 6,
                minWidth: 44, minHeight: 44,
              }}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Mobile dropdown drawer */}
      {isMobile && mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-primary)',
          padding: '8px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'sticky', top: 64, zIndex: 99,
        }}>
          {[
            { href: '/jobs', label: 'Browse Jobs' },
            { href: '/founder-login', label: 'Sign In' },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{
              display: 'block', padding: '12px 0',
              fontSize: 14, fontWeight: 500,
              color: 'var(--color-text-muted)', textDecoration: 'none',
              minHeight: 44,
              borderBottom: '1px solid var(--color-border)',
            }}>
              {label}
            </a>
          ))}
          <a href="/apply" style={{
            display: 'block', marginTop: 12, padding: '10px 16px',
            background: 'var(--color-blue)', color: '#fff',
            borderRadius: 8, fontWeight: 600, fontSize: 14,
            textDecoration: 'none', textAlign: 'center',
          }}>
            Apply for Access
          </a>
        </div>
      )}
    </>
  )
}

// ─── Early Access Form ─────────────────────────────────────────────────────────

function EarlyAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', county: '', work_type: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

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
      <div style={{
        padding: '28px 32px',
        backgroundColor: 'var(--color-green-soft)',
        border: '1px solid var(--color-green-border)',
        borderRadius: 14, textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          backgroundColor: 'var(--color-green-dim)',
          border: '1px solid var(--color-green-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-green)', marginBottom: 8 }}>
          You&apos;re on the list.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
          We&apos;ll be in touch when the network opens in your area.
        </p>
      </div>
    )
  }

  const fieldStyle = {
    background: 'var(--color-input-bg)',
    border: '1px solid var(--color-input-border)',
    borderRadius: 10,
    padding: '12px 16px',
    color: 'var(--color-input-text)',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="John Smith"
            style={fieldStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@company.com"
            style={fieldStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
            County
          </label>
          <select
            value={form.county}
            onChange={e => update('county', e.target.value)}
            style={{ ...fieldStyle, cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          >
            <option value="">Select county</option>
            <option value="Montgomery County, PA">Montgomery County, PA</option>
            <option value="Bucks County, PA">Bucks County, PA</option>
            <option value="Delaware County, PA">Delaware County, PA</option>
            <option value="Philadelphia County, PA">Philadelphia County, PA</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
            Type of Work
          </label>
          <input
            type="text"
            value={form.work_type}
            onChange={e => update('work_type', e.target.value)}
            placeholder="e.g., Interior painting"
            style={fieldStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          />
        </div>
      </div>
      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
          backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-red)',
          color: 'var(--color-red)',
        }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%', marginTop: 8,
          background: 'var(--color-blue)', color: '#fff',
          border: 'none', padding: '15px', borderRadius: 10,
          fontSize: 15, fontWeight: 700,
          cursor: submitting ? 'default' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          opacity: submitting ? 0.7 : 1,
          transition: 'background 0.2s',
        }}
      >
        {submitting ? 'Submitting\u2026' : 'Request Early Access \u2192'}
      </button>
    </form>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  // ── Live stats — fetched from /api/stats ─────────────────────────────────
  const [stats, setStats] = useState<{
    totalPainters: number
    activeToday: number
    jobsCompleted: number
  } | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setStats(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text)',
      fontFamily: 'Inter, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* NAV */}
      <HomepageNav />

      {/* ─── HERO ─── */}
      <section
        id="homepage-hero"
        data-homepage-hero
        style={{
          background: 'var(--color-bg-primary)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background: full-width reference image, transparent-edge overlay — one unified composition */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0,
        }}>
          <img
            src="/hero-bg.png"
            alt=""
            style={{
              position: 'absolute', left: 0, top: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* Transparent-edge overlay — image visible from left edge, darkness grows toward right */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(2,8,20,0.18) 0%, rgba(2,8,20,0.28) 25%, rgba(2,8,20,0.50) 50%, rgba(2,8,20,0.60) 100%)',
          }}/>
          {/* Ambient blue glow — top right, subtle */}
          <div style={{
            position: 'absolute', top: '-25%', right: '-5%',
            width: '55%', height: '90%',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.09) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          {/* Bottom fade — smooth transition into ticker */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '140px',
            background: 'linear-gradient(to bottom, transparent, rgba(2,8,20,0.5))',
            pointerEvents: 'none',
          }}/>
        </div>

        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 56px 0', position: 'relative', zIndex: 1 }}>

          {/* Top row: hero content + stats panel — balanced 2-column layout */}
          <div
            className="hero-stats-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 280px',
              alignItems: 'stretch',
              gap: 40,
              paddingBottom: 48,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Left — hero content */}
            <div style={{ paddingTop: 4 }}>

              {/* Phase badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(37,99,235,0.12)',
                border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: 100, padding: '6px 14px',
                marginBottom: 20,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: 'var(--color-blue)',
                }}/>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: 2, textTransform: 'uppercase',
                  color: 'var(--color-blue)',
                }}>
                  Phase 1 — Montgomery, Bucks, Delaware & Philadelphia
                </span>
              </div>

              {/* Main headline — must name the network */}
              <h1 className="hero-headline" style={{
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 900, lineHeight: 1.0,
                letterSpacing: '-2.5px',
                maxWidth: 800, marginBottom: 16,
                color: '#fff',
              }}>
                The Vetted Contractor Network for Overflow Painting Work.
              </h1>

              {/* Subheadline — defines the network in plain language */}
              <p style={{
                fontSize: 16, color: 'rgba(255,255,255,0.78)',
                maxWidth: 720, lineHeight: 1.7,
                marginBottom: 20, letterSpacing: '-0.1px',
              }}>
                TradeSource is a closed network of vetted painting contractors. Post your overflow at your fixed rate — contractors in the network express interest, you review them, and you choose who does the work. No bidding, no lead fees.
              </p>

              {/* Feature highlight row — AI scope builder promoted here, in the hero */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(5,150,105,0.1)',
                border: '1px solid rgba(5,150,105,0.25)',
                borderRadius: 100, padding: '6px 14px',
                marginBottom: 16,
              }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  textTransform: 'uppercase', color: '#10b981',
                }}>
                  AI Scope Builder — describe your job, get a complete scope in seconds
                </span>
              </div>

              {/* Trust badge row */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                marginBottom: 16,
              }}>
                {[
                  { label: '5 Vetting Checks', color: 'var(--color-blue)' },
                  { label: '0 Lead Fees', color: '#10b981' },
                  { label: 'Fixed Price Only', color: 'var(--color-blue)' },
                  { label: 'Work Stays Private', color: 'rgba(255,255,255,0.5)' },
                ].map(badge => (
                  <div key={badge.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 100, padding: '5px 12px',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: badge.color }}/>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: 'rgba(255,255,255,0.75)',
                      letterSpacing: 0.5,
                    }}>{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* Live proof strip — dynamic, honest framing */}
              <div
                data-mobile-proof
                style={{
                  display: 'flex', flexWrap: 'wrap', gap: 10,
                  marginBottom: 16, maxWidth: 700,
                }}
              >
                {[
                  {
                    dot: '#10b981',
                    get text() {
                      const open = stats?.activeToday ?? null
                      if (open === null) return 'Jobs opening across the network'
                      if (open === 0) return 'First jobs coming to the network soon'
                      if (open === 1) return '1 open job posted in Phase 1'
                      return `${open} open jobs posted in Phase 1`
                    },
                  },
                  { dot: 'var(--color-blue)', text: 'Live across Montgomery, Bucks, Delaware & Philadelphia counties' },
                  { dot: '#10b981', text: 'Every contractor verified before access is granted' },
                ].map(item => (
                  <div key={item.text} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 100, padding: '5px 12px',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: item.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Value line */}
              <div style={{
                fontSize: 13, color: 'rgba(255,255,255,0.68)',
                marginBottom: 20, maxWidth: 480, lineHeight: 1.6,
              }}>
                Phase 1 is open now — early approved contractors get first access to posted work as the network grows county by county.
              </div>

              {/* CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Primary — dominant */}
                <a href="/apply"
                  onClick={() => trackClick('apply_for_access', 'hero_primary')}
                  style={{
                    background: 'var(--color-blue)', color: '#fff',
                    padding: '15px 28px', borderRadius: 10,
                    fontWeight: 700, fontSize: 15, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
                    transition: 'background 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-blue-hover)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-blue)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'none'
                  }}>
                  Apply for Access
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                {/* Secondary — subtle text link */}
                <a href="/jobs"
                  onClick={() => trackClick('browse_jobs_first', 'hero_secondary')}
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}>
                  Browse open jobs first
                </a>
              </div>
              {/* Micro-direction label */}
              <p style={{
                fontSize: 12, fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: 10,
              }}>
                The first step — a 5-minute application
              </p>
            </div>

            {/* Right — stats panel — hidden on mobile via CSS
               CSS shows it on tablet+ via .hero-stats-row > [data-mobile-panel][data-mobile-grid] */}
            <div
              className="hero-stats-panel"
              data-mobile-grid="stats"
              data-mobile-panel="true"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(5,20,50,0.72)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(59,130,246,0.28)',
                borderRadius: 14, padding: '28px 24px',
                boxShadow: 'inset 0 1px 0 rgba(59,130,246,0.15), 0 8px 40px rgba(0,0,0,0.35)',
                alignSelf: 'stretch',
              }}
            >
              {/* Top: header + stats list */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2,
                  textTransform: 'uppercase', color: 'rgba(59,130,246,0.65)',
                  marginBottom: 16,
                }}>
                  Network at a Glance
                </div>
                {[
                  { n: '4', label: 'Counties Covered', color: '#fff' },
                  { n: '5', label: 'Vetting Checks', color: 'var(--color-blue)' },
                  { n: '0', label: 'Lead Fees', color: '#10b981' },
                  {
                    n: stats ? `${stats.totalPainters}` : '…',
                    label: 'Contractors Approved',
                    color: '#10b981',
                    loading: !stats,
                  },
                ].map((stat, i) => (
                  <div key={stat.label} style={{
                    padding: '10px 0',
                    borderBottom: i < 3 ? '1px solid rgba(59,130,246,0.08)' : 'none',
                  }}>
                    <div style={{
                      fontSize: 26, fontWeight: 800, letterSpacing: '-1px',
                      color: stat.color, lineHeight: 1,
                      opacity: stat.loading ? 0.4 : 1,
                    }}>{stat.n}</div>
                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.50)',
                      marginTop: 4, fontWeight: 500,
                    }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Desktop-only: mini "how it works" path inside the stats panel — anchored to bottom ── */}
              <div className="desktop-stats-path" style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(59,130,246,0.10)' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2,
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  marginBottom: 16,
                }}>
                  How it works
                </div>
                {[
                  { num: '1', text: 'Post your work at your fixed rate' },
                  { num: '2', text: 'Contractors in the network respond' },
                  { num: '3', text: 'You review profiles and choose who does the work' },
                ].map((step, i) => (
                  <div key={step.num} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    marginBottom: i < 2 ? 12 : 0,
                  }}>
                    <div style={{
                      width: 20, height: 20, minWidth: 20, borderRadius: '50%',
                      background: i === 0 ? 'rgba(37,99,235,0.30)' : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${i === 0 ? 'rgba(37,99,235,0.45)' : 'rgba(255,255,255,0.12)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800, color: i === 0 ? 'var(--color-blue)' : 'rgba(255,255,255,0.40)',
                      flexShrink: 0,
                    }}>
                      {step.num}
                    </div>
                    <span style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.55)',
                      lineHeight: 1.5, paddingTop: 3,
                    }}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TICKER — integrated with hero atmosphere via gradient ─── */}
      <div style={{
        background: 'linear-gradient(to bottom, rgba(3,12,26,0.85), rgba(12,24,48,0.03))',
        padding: '20px 56px 16px',
        borderTop: '1px solid rgba(59,130,246,0.07)',
      }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexWrap: 'wrap',
          gap: 6,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: 'rgba(59,130,246,0.70)',
            whiteSpace: 'nowrap',
          }}>
            ✓ Verified
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {[
              'PA Contractor License',
              'Insurance on File',
              'W-9 Verified',
              'Experience Checked',
              'External Review Required',
              'Phase 1 — Painting Only',
            ].map((item) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.01em',
              }}>
                <div style={{
                  width: 3, height: 3, borderRadius: '50%',
                  backgroundColor: 'rgba(16,185,129,0.6)', flexShrink: 0,
                }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── THE NETWORK — three core claims ─── */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 56px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            The network
          </div>
          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 56,
            color: 'var(--color-text)', maxWidth: 600,
          }}>
            The three things that make TradeSource work.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                title: 'Fixed Price. No Bidding.',
                desc: 'You set the rate. Contractors in the network express interest at your price. You choose who gets the work — not an algorithm, not whoever guessed lowest.',
                color: 'var(--color-blue)',
              },
              {
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={1.75}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                title: 'AI Scope Builder Included',
                desc: 'Describe your job in plain language — the AI writes a complete, professional scope that contractors can actually use. Fewer missed items, fewer callbacks, faster quotes.',
                color: '#10b981',
              },
              {
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: 'Work Stays Private Between Contractors',
                desc: 'Every job posted and accepted stays between the two contractors involved. Your clients, your reputation, your rates — no public board, no ads, no exposure.',
                color: 'var(--color-blue)',
              },
            ].map(item => (
              <div key={item.title} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24,
                alignItems: 'start',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                padding: '28px 32px', borderRadius: 12,
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div style={{
                  width: 48, height: 48,
                  background: item.color === '#10b981' ? 'rgba(5,150,105,0.1)' : 'var(--color-blue-dim)',
                  border: `1px solid ${item.color === '#10b981' ? 'rgba(5,150,105,0.25)' : 'var(--color-blue-border)'}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)', letterSpacing: '-0.2px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 560 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS — 3 steps (replaced 5-step process section) ─── */}
      {/* Subtle top fade — signals a new visual chapter */}
      <div aria-hidden="true" style={{
        height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)',
      }}/>
      <section style={{ padding: '64px 56px', background: 'var(--color-bg-primary)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            How it works
          </div>
          <div style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 56,
            color: 'var(--color-text)',
          }}>
            Three steps to your first network job.
          </div>

          <div className="homepage-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                num: '01',
                title: 'Apply for access',
                desc: 'Submit your PA license, insurance, W-9, trade experience, and at least one external review. Every application is reviewed personally.',
              },
              {
                num: '02',
                title: 'Post your overflow at your rate',
                desc: "Once approved, you access the network. Use the AI Scope Builder to write your job description — then post it at your fixed price. Contractors in the network see it and respond.",
              },
              {
                num: '03',
                title: 'Review and choose who you work with',
                desc: "Contractors express interest. You see their profiles, their experience, and their history. You decide who gets the job — no algorithm, no bidding, no surprises.",
              },
            ].map((step, i) => (
              <div key={step.num} style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(37,99,235,0.10)',
                borderLeft: '3px solid rgba(37,99,235,0.40)',
                borderRadius: 14, padding: '40px 36px',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s, border-left-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)'
                  e.currentTarget.style.borderLeftColor = 'rgba(37,99,235,0.70)'
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.20), 0 0 0 1px rgba(37,99,235,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(37,99,235,0.10)'
                  e.currentTarget.style.borderLeftColor = 'rgba(37,99,235,0.40)'
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'
                }}>
                {/* Step number — large, decorative, left-aligned for uniqueness */}
                <div style={{
                  fontSize: 48, fontWeight: 900,
                  letterSpacing: '-3px',
                  color: 'rgba(37,99,235,0.08)',
                  position: 'absolute', top: 20, right: 28,
                  lineHeight: 1, pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  {step.num}
                </div>
                {/* Visible step badge — small, blue */}
                <div style={{
                  display: 'inline-block',
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: 'var(--color-blue)',
                  backgroundColor: 'rgba(37,99,235,0.10)',
                  border: '1px solid rgba(37,99,235,0.20)',
                  borderRadius: 100, padding: '4px 10px',
                  lineHeight: 1, marginBottom: 20,
                }}>
                  Step {step.num}
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 700, marginBottom: 12,
                  letterSpacing: '-0.2px', color: 'var(--color-text)',
                  position: 'relative', zIndex: 1,
                }}>
                  {step.title}
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--color-text-muted)',
                  lineHeight: 1.7, position: 'relative', zIndex: 1,
                }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SCOPE BUILDER — promoted as a dedicated section ─── */}
      <section className="ai-section-wrapper" style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '64px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
      {/* Atmosphere: dark and atmospheric in dark mode, subtle slate in light mode */}
      <div aria-hidden="true" className="ai-section-atmo" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, transparent 40%, rgba(16,185,129,0.02) 100%)',
        pointerEvents: 'none',
      }}/>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="ai-section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            {/* Left — copy */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(5,150,105,0.1)',
                border: '1px solid rgba(5,150,105,0.25)',
                borderRadius: 100, padding: '6px 14px',
                marginBottom: 20,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}/>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  textTransform: 'uppercase', color: '#10b981',
                }}>
                  Built into the platform
                </span>
              </div>
              <div style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900,
                letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
                color: 'var(--color-text)',
              }}>
                AI Scope Builder — describe the job, get a complete scope.
              </div>
              <p style={{
                fontSize: 15, color: 'var(--color-text-muted)',
                lineHeight: 1.7, marginBottom: 24,
              }}>
                Most contractor-to-contractor communication breaks down at the scope. A few texts back and forth, things get missed, the quote comes in wrong, the job goes sideways.
              </p>
              <p style={{
                fontSize: 15, color: 'var(--color-text-muted)',
                lineHeight: 1.7, marginBottom: 32,
              }}>
                The AI Scope Builder solves that. You answer a few questions about the job — square footage, surface type, prep work, number of coats, trim included or not. The AI writes a complete, professional scope that contractors can actually use to give you an accurate quote.
              </p>
              {[
                'No missed line items in the scope',
                'Fewer callbacks and change orders',
                'Contractors respond faster with complete scopes',
                'Your scope, your terms — edit before posting',
              ].map(point => (
                <div key={point} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  marginBottom: 10,
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* Right — visual mockup — elevated to feel like a real product screen */}
            <div className="ai-scope-preview" style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-md)',
              borderRadius: 16, padding: '36px 32px',
              position: 'relative',
              boxShadow: '0 0 60px rgba(37,99,235,0.06), 0 20px 48px rgba(0,0,0,0.18)',
            }}>
              {/* Ambient glow behind the preview card */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: '-30px', right: '-30px',
                width: '200px', height: '200px',
                background: 'radial-gradient(ellipse, rgba(37,99,235,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}/>
              <div className="ai-preview-header" style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'var(--color-blue)',
                marginBottom: 20, paddingBottom: 16,
                borderBottom: '1px solid var(--color-border)',
              }}>
                Scope Builder — Live Preview
              </div>
              {/* Simulated scope form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Property', value: 'Single-family home' },
                  { label: 'Scope', value: 'Interior painting' },
                  { label: 'Area', value: '2,400 sq ft' },
                  { label: 'Surfaces', value: 'Walls, ceilings, baseboards' },
                  { label: 'Prep', value: 'Patch, sand, prime' },
                  { label: 'Coats', value: '2 coats throughout' },
                ].map(field => (
                  <div key={field.label} className="ai-preview-field">
                    <div className="ai-preview-label">{field.label}</div>
                    <div className="ai-preview-value">{field.value}</div>
                  </div>
                ))}
                {/* Generated scope output — the star of the card */}
                <div className="ai-scope-output">
                  <div className="ai-scope-output-label">
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    AI Generated Scope
                  </div>
                  <div className="ai-scope-output-text">
                    Full interior repaint of 2,400 sq ft single-family home. Walls, ceilings, and baseboards in eggshell finish. Two coats premium latex throughout. All surfaces patched, sanded, and primed prior to coating. Trim in semi-gloss. Owner selects paint color. All materials and labor included.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THREE CONTRACTOR TYPES ─── */}
      <section style={{
        padding: '64px 56px', background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            Who It&apos;s For
          </div>
          <div style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
            color: 'var(--color-text)',
          }}>
            Three types of contractors use TradeSource
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 48,
          }}>
            The network works because everyone in it has something to offer and something they need.
          </p>

          <div className="homepage-contractors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                num: '01', tag: 'Overflow',
                title: 'Contractors with more work than their crew can handle',
                body: 'You landed the job. You need reliable help to finish it. Post the work at your rate, connect with a vetted sub, keep the customer, move on.',
              },
              {
                num: '02', tag: 'Subs',
                title: "Subcontractors who do good work but can't find enough of it",
                body: "You're solid. You show up. You do the job right. But consistent work isn't guaranteed. TradeSource puts you inside a network that needs exactly what you offer.",
              },
              {
                num: '03', tag: 'Next-Gen',
                title: 'Next-generation operators who sell without building a crew',
                body: "You can close a job. You don't want to manage a crew. Post the work, find the right sub, fulfill what you sold — without the overhead.",
              },
            ].map(card => (
              <div key={card.num} style={{
                background: 'var(--color-bg-card)',
                borderTop: '2px solid rgba(59,130,246,0.50)',
                borderLeft: '1px solid var(--color-border)',
                borderRight: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                borderRadius: 14, padding: '40px 36px',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s, border-top-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderTopColor = 'rgba(59,130,246,0.85)'
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.25), 0 0 0 1px rgba(37,99,235,0.10)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderTopColor = 'rgba(59,130,246,0.50)'
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'
                }}>
                {/* Contractor number — decorative watermark */}
                <div style={{
                  position: 'absolute', bottom: 16, right: 20,
                  fontSize: 64, fontWeight: 900,
                  letterSpacing: '-4px',
                  color: 'rgba(37,99,235,0.05)',
                  lineHeight: 1, pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  {card.num}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: 'rgba(59,130,246,0.80)',
                  marginBottom: 14, position: 'relative', zIndex: 1,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 18, height: 18, minWidth: 18,
                    background: 'rgba(37,99,235,0.12)',
                    border: '1px solid rgba(37,99,235,0.20)',
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 900, color: 'var(--color-blue)',
                  }}>
                    {card.num}
                  </div>
                  {card.tag}
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 700, marginBottom: 12,
                  letterSpacing: '-0.2px', position: 'relative', zIndex: 1,
                  color: 'var(--color-text)',
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--color-text-muted)',
                  lineHeight: 1.7, position: 'relative', zIndex: 1,
                }}>
                  {card.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VETTING ─── */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        padding: '64px 56px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            Trust
          </div>
          <div style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
            color: 'var(--color-text)',
          }}>
            How we vet every contractor
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 48,
          }}>
            Every contractor is verified before they get access. No exceptions, no shortcuts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Valid PA Contractor License', body: 'We verify your license number against Pennsylvania state records before you get access.' },
              { title: 'Proof of Insurance', body: 'We require a current certificate of insurance. No insurance, no exceptions.' },
              { title: 'W-9 Tax Documentation', body: 'We collect a W-9 to confirm your business identity and tax information before access is granted.' },
              { title: 'Trade Experience Verification', body: "We verify documented experience in your trade — not just a license, but actual work history." },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)', borderRadius: 14,
                padding: '28px 32px', display: 'flex', gap: 20,
                alignItems: 'flex-start', transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-green-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div style={{
                  width: 36, height: 36, minWidth: 36,
                  background: 'var(--color-green-dim)',
                  border: '1px solid var(--color-green-border)',
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {item.body}
                  </div>
                </div>
              </div>
            ))}
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)', borderRadius: 14,
              padding: '28px 32px', display: 'flex', gap: 20,
              alignItems: 'flex-start', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-green-border)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
              <div style={{
                width: 36, height: 36, minWidth: 36,
                background: 'var(--color-green-dim)',
                border: '1px solid var(--color-green-border)',
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>
                  At Least One External Review
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  We confirm at least one review from a real customer or trade reference — Google Business Profile, Houzz, Angi, or equivalent. Not self-reported. Verified.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="closing-cta-section" style={{
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '80px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient glow behind CTA */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16,
            color: 'var(--color-text)',
          }}>
            Your next job is in the network.
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            lineHeight: 1.7, marginBottom: 32,
          }}>
            Phase 1 is open to painting contractors in Montgomery, Bucks, Delaware, and Philadelphia counties. Submit one application — our team reviews every one personally.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/apply"
              onClick={() => trackClick('apply_for_access', 'closing_cta')}
              style={{
                background: 'var(--color-blue)', color: '#fff',
                padding: '14px 28px', borderRadius: 10,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--color-blue-hover)'
                el.style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--color-blue)'
                el.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)'
              }}>
              Apply for Access
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="/jobs"
              onClick={() => trackClick('browse_jobs', 'closing_cta')}
              style={{
                color: 'var(--color-text-muted)',
                padding: '14px 20px', borderRadius: 10,
                fontWeight: 500, fontSize: 14, textDecoration: 'none',
                border: '1px solid var(--color-border)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'border-color 0.2s, color 0.2s, box-shadow 0.2s',
                boxShadow: 'var(--ts-shadow-card)',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-blue-border)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--ts-shadow-card-hover)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--ts-shadow-card)'
              }}>
              Browse Open Jobs
            </a>
          </div>
          <p style={{
            fontSize: 12, color: 'var(--color-text-subtle)',
            marginTop: 16, lineHeight: 1.5,
          }}>
            Questions? <a href="mailto:info@tradesource.app" style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>info@tradesource.app</a>
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid rgba(255,255,255,0.04)', padding: '56px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 40, gap: 40, flexWrap: 'wrap',
          }}>
            <div>
              <a href="/" style={{
                fontSize: 18, fontWeight: 800,
                color: 'var(--color-text)', textDecoration: 'none',
                letterSpacing: '-0.3px',
              }}>
                Trade<span style={{ color: 'var(--color-blue)' }}>Source</span>
              </a>
              <p style={{
                fontSize: 13, color: 'var(--color-text-muted)',
                marginTop: 8, maxWidth: 240, lineHeight: 1.6,
              }}>
                The vetted contractor network for overflow painting work. Fixed price, no bidding, no lead fees.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 64 }}>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: 'var(--color-text-subtle)', marginBottom: 14,
                }}>Product</div>
                {[
                  { href: '/jobs', label: 'Browse Jobs' },
                  { href: '/apply', label: 'Apply' },
                  { href: '/founder-login', label: 'Sign In' },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{
                    display: 'block', color: 'var(--color-text-muted)',
                    textDecoration: 'none', fontSize: 13, marginBottom: 10,
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                    {l.label}
                  </a>
                ))}
              </div>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: 'var(--color-text-subtle)', marginBottom: 14,
                }}>Company</div>
                {[
                  { href: '/privacy-policy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: 'mailto:info@tradesource.app', label: 'Contact' },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{
                    display: 'block', color: 'var(--color-text-muted)',
                    textDecoration: 'none', fontSize: 13, marginBottom: 10,
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            paddingTop: 24, borderTop: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
              2026 TradeSource. All rights reserved. Phase 1 — Painting services only.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Montgomery County', 'Bucks County', 'Delaware County', 'Philadelphia', 'Painting Only'].map(tag => (
                <span key={tag} style={{
                  fontSize: 11, fontWeight: 600,
                  background: 'var(--color-blue-soft)',
                  border: '1px solid var(--color-blue-border)',
                  color: 'var(--color-blue)',
                  padding: '4px 10px', borderRadius: 100,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
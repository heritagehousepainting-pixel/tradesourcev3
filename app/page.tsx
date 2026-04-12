'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/app/theme-toggle'

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
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              Browse Jobs
            </a>
            <a href="/apply" style={{
              color: 'var(--color-text-muted)', textDecoration: 'none',
              fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
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
              Request Access
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
            Request Access
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
        data-homepage-hero
        style={{
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* ── Circuit-core hero background ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
                    <svg
            className="hero-circuit-svg"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
            }}
          >
            <defs>
              {/* Ambient glow — for circuit lines */}
              <filter id="cglow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Core center glow — layered, strong */}
              <filter id="coreglow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b1"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2"/>
                <feMerge>
                  <feMergeNode in="b1"/>
                  <feMergeNode in="b1"/>
                  <feMergeNode in="b2"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Chip body glow — medium, precise */}
              <filter id="chipglow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Vignette: edges dark, center open for text */}
              <radialGradient id="cvignette" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="transparent"/>
                <stop offset="50%"  stopColor="transparent"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.65)"/>
              </radialGradient>
              {/* Core center radial: bright core fading outward */}
              <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(59,130,246,0.65)"/>
                <stop offset="30%"  stopColor="rgba(37,99,235,0.35)"/>
                <stop offset="70%"  stopColor="rgba(30,64,160,0.10)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              {/* Ambient core glow: wide soft blue wash */}
              <radialGradient id="ambient-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(37,99,235,0.30)"/>
                <stop offset="50%"  stopColor="rgba(30,64,160,0.12)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              {/* Chip body fill */}
              <linearGradient id="chip-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="rgba(40,80,150,0.60)"/>
                <stop offset="100%" stopColor="rgba(20,45,100,0.75)"/>
              </linearGradient>
              {/* Bottom fade */}
              <linearGradient id="c-bottom-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="transparent"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.40)"/>
              </linearGradient>
            </defs>

            {/* LAYER 0: Atmospheric depth — deep corners */}
            <g className="hero-circuit-depth" opacity="0.15" style={{stroke: '#3B82F6', strokeOpacity: 0.15}}>
              <path d="M 0 0 L 480 0 L 360 180 L 0 180 Z" fill="rgba(0,0,0,0.4)" stroke="none"/>
              <path d="M 1440 0 L 960 0 L 1080 180 L 1440 180 Z" fill="rgba(0,0,0,0.4)" stroke="none"/>
              <path d="M 0 900 L 480 900 L 360 720 L 0 720 Z" fill="rgba(0,0,0,0.4)" stroke="none"/>
              <path d="M 1440 900 L 960 900 L 1080 720 L 1440 720 Z" fill="rgba(0,0,0,0.4)" stroke="none"/>
            </g>

            {/* LAYER 0b: Faint structural grid (PCB substrate) */}
            <g className="hero-circuit-grid" opacity="0.10" style={{stroke: '#3B82F6', strokeOpacity: 0.10}}>
              <line x1="0" y1="180" x2="1440" y2="180" strokeWidth="0.5"/>
              <line x1="0" y1="360" x2="1440" y2="360" strokeWidth="0.4"/>
              <line x1="0" y1="540" x2="1440" y2="540" strokeWidth="0.5"/>
              <line x1="0" y1="720" x2="1440" y2="720" strokeWidth="0.4"/>
              <line x1="240"  y1="0" x2="240"  y2="900" strokeWidth="0.4"/>
              <line x1="480"  y1="0" x2="480"  y2="900" strokeWidth="0.3"/>
              <line x1="720"  y1="0" x2="720"  y2="900" strokeWidth="0.3"/>
              <line x1="960"  y1="0" x2="960"  y2="900" strokeWidth="0.3"/>
              <line x1="1200" y1="0" x2="1200" y2="900" strokeWidth="0.4"/>
              <circle cx="480"  cy="360" r="1" opacity="0.3" fill="#3B82F6" style={{fill: '#3B82F6'}}/>
              <circle cx="960"  cy="360" r="1" opacity="0.3" fill="#3B82F6" style={{fill: '#3B82F6'}}/>
              <circle cx="480"  cy="540" r="1" opacity="0.3" fill="#3B82F6" style={{fill: '#3B82F6'}}/>
              <circle cx="960"  cy="540" r="1" opacity="0.3" fill="#3B82F6" style={{fill: '#3B82F6'}}/>
              <circle cx="720"  cy="180" r="1" opacity="0.3" fill="#3B82F6" style={{fill: '#3B82F6'}}/>
              <circle cx="720"  cy="720" r="1" opacity="0.3" fill="#3B82F6" style={{fill: '#3B82F6'}}/>
            </g>

            {/* LAYER 1: Central chip core — larger, more commanding */}
            <circle cx="720" cy="450" r="160" fill="url(#ambient-grad)" filter="url(#coreglow)" opacity="0.5"/>
            <circle cx="720" cy="450" r="110" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.18"/>
            <circle cx="720" cy="450" r="80"  fill="none" stroke="#3B82F6" strokeWidth="1.2" opacity="0.25"/>
            <circle cx="720" cy="450" r="100" fill="url(#core-grad)" filter="url(#coreglow)"/>
            {/* Chip body: 140x84px, centered on 720,450 */}
            <g filter="url(#chipglow)">
              <path d="M 650 408 L 790 408 L 790 492 L 650 492 Z"
                    fill="url(#chip-fill)" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.85" opacity="0.90"/>
              {/* Pin rows — left side (5 pins) */}
              <line x1="636" y1="420" x2="650" y2="420" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="636" y1="432" x2="650" y2="432" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="636" y1="450" x2="650" y2="450" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="636" y1="468" x2="650" y2="468" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="636" y1="480" x2="650" y2="480" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              {/* Pin rows — right side (5 pins) */}
              <line x1="790" y1="420" x2="804" y2="420" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="790" y1="432" x2="804" y2="432" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="790" y1="450" x2="804" y2="450" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="790" y1="468" x2="804" y2="468" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="790" y1="480" x2="804" y2="480" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              {/* Pin rows — top (6 pins) */}
              <line x1="662" y1="396" x2="662" y2="408" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="678" y1="396" x2="678" y2="408" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="694" y1="396" x2="694" y2="408" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="720" y1="396" x2="720" y2="408" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="746" y1="396" x2="746" y2="408" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="778" y1="396" x2="778" y2="408" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              {/* Pin rows — bottom (6 pins) */}
              <line x1="662" y1="492" x2="662" y2="504" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="678" y1="492" x2="678" y2="504" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="694" y1="492" x2="694" y2="504" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="720" y1="492" x2="720" y2="504" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="746" y1="492" x2="746" y2="504" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              <line x1="778" y1="492" x2="778" y2="504" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.70"/>
              {/* Chip center dot — larger */}
              <circle cx="720" cy="450" r="5.5" fill="#93C5FD" opacity="0.95"/>
              {/* Chip inner cross-hair */}
              <line x1="705" y1="450" x2="735" y2="450" stroke="#93C5FD" strokeWidth="0.6" opacity="0.5"/>
              <line x1="720" y1="435" x2="720" y2="465" stroke="#93C5FD" strokeWidth="0.6" opacity="0.5"/>
              {/* Chip corner accent marks */}
              <line x1="654" y1="412" x2="662" y2="412" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="654" y1="412" x2="654" y2="420" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="778" y1="412" x2="786" y2="412" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="786" y1="412" x2="786" y2="420" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="654" y1="488" x2="662" y2="488" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="654" y1="480" x2="654" y2="488" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="778" y1="488" x2="786" y2="488" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
              <line x1="786" y1="480" x2="786" y2="488" stroke="#93C5FD" strokeWidth="1" opacity="0.4"/>
            </g>

            {/* LAYER 2: Primary signal routes — thicker, brighter */}
            <g className="hero-circuit-primary" filter="url(#cglow)" opacity="0.50">
              <line x1="200" y1="450" x2="540" y2="450" stroke="#3B82F6" strokeWidth="1.8" opacity="0.80"/>
              <line x1="540" y1="450" x2="636" y2="450" stroke="#3B82F6" strokeWidth="1.5" opacity="0.75"/>
              <line x1="1240" y1="450" x2="900" y2="450" stroke="#3B82F6" strokeWidth="1.8" opacity="0.80"/>
              <line x1="900" y1="450" x2="804" y2="450" stroke="#3B82F6" strokeWidth="1.5" opacity="0.75"/>
              <line x1="720" y1="80"  x2="720" y2="396" stroke="#3B82F6" strokeWidth="1.8" opacity="0.80"/>
              <line x1="720" y1="80"  x2="720" y2="60"  stroke="#3B82F6" strokeWidth="1.5" opacity="0.60"/>
              <line x1="720" y1="820" x2="720" y2="504" stroke="#3B82F6" strokeWidth="1.8" opacity="0.80"/>
              <line x1="720" y1="820" x2="720" y2="840" stroke="#3B82F6" strokeWidth="1.5" opacity="0.60"/>
            </g>

            {/* LAYER 3: Secondary routed traces */}
            <g className="hero-circuit-traces" filter="url(#cglow)" opacity="0.55">
              <path d="M 360 0 L 360 140 L 380 140 L 380 180 L 420 180 L 420 240 L 480 240 L 480 300 L 560 300 L 560 360 L 620 360 L 620 408"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 720 0 L 720 60 L 680 60 L 680 120 L 640 120 L 640 180 L 620 180 L 620 280 L 640 280 L 640 320 L 680 320 L 680 380 L 700 380 L 700 408"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.55"/>
              <path d="M 1080 0 L 1080 100 L 1060 100 L 1060 160 L 1020 160 L 1020 220 L 980 220 L 980 280 L 920 280 L 920 340 L 860 340 L 860 408"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 360 900 L 360 760 L 380 760 L 380 720 L 420 720 L 420 660 L 480 660 L 480 600 L 560 600 L 560 540 L 620 540 L 620 492"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 720 900 L 720 840 L 680 840 L 680 780 L 640 780 L 640 720 L 620 720 L 620 620 L 640 620 L 640 580 L 680 580 L 680 520 L 700 520 L 700 492"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.55"/>
              <path d="M 1080 900 L 1080 800 L 1060 800 L 1060 740 L 1020 740 L 1020 680 L 980 680 L 980 620 L 920 620 L 920 560 L 860 560 L 860 492"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 0 200 L 80 200 L 80 220 L 140 220 L 140 280 L 200 280 L 200 340 L 260 340 L 260 380 L 320 380 L 320 420 L 540 420 L 540 450"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 0 700 L 60 700 L 60 680 L 120 680 L 120 620 L 180 620 L 180 580 L 260 580 L 260 540 L 320 540 L 320 492"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 1440 200 L 1360 200 L 1360 220 L 1300 220 L 1300 280 L 1240 280 L 1240 340 L 1180 340 L 1180 380 L 1120 380 L 1120 420 L 900 420 L 900 450"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 1440 700 L 1380 700 L 1380 680 L 1320 680 L 1320 620 L 1260 620 L 1260 580 L 1180 580 L 1180 540 L 1120 540 L 1120 492"
                    fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.60"/>
              <path d="M 0 0 L 60 0 L 60 60 L 140 60 L 140 140 L 240 140 L 240 200 L 320 200 L 320 260 L 400 260 L 400 340 L 480 340 L 480 408"
                    fill="none" stroke="#3B82F6" strokeWidth="0.8" opacity="0.40"/>
              <path d="M 1440 0 L 1380 0 L 1380 60 L 1300 60 L 1300 140 L 1200 140 L 1200 200 L 1120 200 L 1120 260 L 1040 260 L 1040 340 L 960 340 L 960 408"
                    fill="none" stroke="#3B82F6" strokeWidth="0.8" opacity="0.40"/>
              <path d="M 0 900 L 60 900 L 60 840 L 140 840 L 140 760 L 240 760 L 240 700 L 320 700 L 320 640 L 400 640 L 400 560 L 480 560 L 480 492"
                    fill="none" stroke="#3B82F6" strokeWidth="0.8" opacity="0.40"/>
              <path d="M 1440 900 L 1380 900 L 1380 840 L 1300 840 L 1300 760 L 1200 760 L 1200 700 L 1120 700 L 1120 640 L 1040 640 L 1040 560 L 960 560 L 960 492"
                    fill="none" stroke="#3B82F6" strokeWidth="0.8" opacity="0.40"/>
              <line x1="80"  y1="450" x2="540" y2="450" stroke="#3B82F6" opacity="0.25" strokeWidth="0.7"/>
              <line x1="900" y1="450" x2="1360" y2="450" stroke="#3B82F6" opacity="0.25" strokeWidth="0.7"/>
            </g>

            {/* LAYER 4: Junction nodes */}
            <g className="hero-circuit-nodes" filter="url(#cglow)" opacity="0.85">
              <circle cx="360"  cy="140" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="380"  cy="180" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="420"  cy="240" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="480"  cy="300" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="560"  cy="360" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="620"  cy="408" r="3"   fill="#60A5FA" opacity="0.90"/>
              <circle cx="680"  cy="120" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="640"  cy="180" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="700"  cy="380" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1080" cy="100" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="1060" cy="160" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1020" cy="220" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="980"  cy="280" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="920"  cy="340" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="860"  cy="408" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="360"  cy="760" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="380"  cy="720" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="420"  cy="660" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="480"  cy="600" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="560"  cy="540" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="620"  cy="492" r="3"   fill="#60A5FA" opacity="0.90"/>
              <circle cx="680"  cy="780" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="640"  cy="720" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="700"  cy="520" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1080" cy="800" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="1060" cy="740" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1020" cy="680" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="980"  cy="620" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="920"  cy="560" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="860"  cy="492" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="80"   cy="200" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="140"  cy="280" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="200"  cy="340" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="260"  cy="380" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="320"  cy="420" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="60"   cy="680" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="120"  cy="620" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="180"  cy="580" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="260"  cy="540" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="320"  cy="492" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="1360" cy="200" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1300" cy="280" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1240" cy="340" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1180" cy="380" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1120" cy="420" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="1380" cy="680" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1320" cy="620" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1260" cy="580" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1180" cy="540" r="2"   fill="#60A5FA" opacity="0.65"/>
              <circle cx="1120" cy="492" r="2.5" fill="#60A5FA" opacity="0.75"/>
              <circle cx="200"  cy="450" r="3.5" fill="#93C5FD" opacity="0.85"/>
              <circle cx="540"  cy="450" r="3"   fill="#93C5FD" opacity="0.85"/>
              <circle cx="900"  cy="450" r="3"   fill="#93C5FD" opacity="0.85"/>
              <circle cx="1240" cy="450" r="3.5" fill="#93C5FD" opacity="0.85"/>
              <circle cx="720"  cy="80"  r="3.5" fill="#93C5FD" opacity="0.85"/>
              <circle cx="720"  cy="820" r="3.5" fill="#93C5FD" opacity="0.85"/>
            </g>

            {/* LAYER 5: Outer perimeter circuit loops */}
            <g className="hero-circuit-outer" opacity="0.30" style={{stroke: '#2563EB', strokeOpacity: 0.30}}>
              <path d="M 80 0 L 80 40 L 200 40 L 200 80 L 340 80 L 340 120 L 500 120 L 500 80 L 700 80 L 700 120 L 900 120 L 900 80 L 1100 80 L 1100 120 L 1260 120 L 1260 80 L 1360 80 L 1360 0"
                    fill="none" strokeWidth="0.8"/>
              <path d="M 80 900 L 80 860 L 200 860 L 200 820 L 340 820 L 340 780 L 500 780 L 500 820 L 700 820 L 700 780 L 900 780 L 900 820 L 1100 820 L 1100 780 L 1260 780 L 1260 820 L 1360 820 L 1360 900"
                    fill="none" strokeWidth="0.8"/>
              <path d="M 0 80 L 40 80 L 40 200 L 80 200 L 80 340 L 120 340 L 120 500 L 80 500 L 80 700 L 120 700 L 120 860 L 40 860 L 40 900"
                    fill="none" strokeWidth="0.8"/>
              <path d="M 1440 80 L 1400 80 L 1400 200 L 1360 200 L 1360 340 L 1320 340 L 1320 500 L 1360 500 L 1360 700 L 1320 700 L 1320 860 L 1400 860 L 1400 900"
                    fill="none" strokeWidth="0.8"/>
            </g>

            <rect width="1440" height="900" fill="url(#cvignette)"/>
            <rect x="0" y="640" width="1440" height="260" fill="url(#c-bottom-fade)"/>
          </svg>

          {/* Top-layer radial glow — stronger, more dimensional */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(20,50,140,0.22) 0%, rgba(10,30,80,0.08) 40%, transparent 70%)',
          }}/></div>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 56px 0' }}>

          {/* Top row: left + stats panel */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            alignItems: 'start', gap: 56,
            paddingBottom: 64,
            borderBottom: '1px solid var(--color-border)',
          }}>
            {/* Left */}
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, backgroundColor: 'var(--color-blue)' }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 3,
                  textTransform: 'uppercase', color: 'var(--color-blue)',
                }}>
                  Phase 1 — Philadelphia Region
                </span>
              </div>
              <h1 style={{
                fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 900,
                lineHeight: 1.0, letterSpacing: '-2.5px',
                maxWidth: 760, marginBottom: 20, color: 'var(--color-text)',
              }}>
                Your work.<br />Your rate.<br />Your crew.
              </h1>
              <p style={{
                fontSize: 15, color: 'var(--color-text-muted)',
                maxWidth: 420, lineHeight: 1.65, marginBottom: 28,
              }}>
                A private network of vetted painting contractors in the four-county Philadelphia area. Post jobs at your rate — no bidding, no commission. And AI tools built specifically for the work.mission. And AI tools built specifically for the work.mission.
              </p>
              {/* "Built for contractors" — bold accent badge below sub-copy */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--color-blue-dim)',
                border: '1px solid var(--color-blue-border)',
                borderRadius: 100, padding: '6px 14px',
                marginBottom: 12,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: 'var(--color-blue)',
                }}>
                  Built for contractors
                </span>
              </div>
              {/* AI tools — power badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(5,150,105,0.1)',
                border: '1px solid rgba(5,150,105,0.25)',
                borderRadius: 100, padding: '6px 14px',
                marginBottom: 28,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: '#10b981',
                }}>
                  AI tools built for contractors
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="/apply"
                  style={{
                    background: 'var(--color-blue)', color: '#fff',
                    padding: '14px 28px', borderRadius: 10,
                    fontWeight: 700, fontSize: 15, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
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
                  Apply to Join
                </a>
                <a href="/jobs"
                  style={{
                    background: 'transparent', color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-md)',
                    padding: '14px 24px', borderRadius: 10,
                    fontWeight: 600, fontSize: 15, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-md)'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}>
                  See Open Jobs
                </a>
              </div>
            </div>

            {/* Right — stats panel */}
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-md)',
              borderRadius: 16, padding: 32, minWidth: 240,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'var(--color-text-subtle)',
                marginBottom: 24,
              }}>
                Network at a glance
              </div>
              {[
                { n: '4', label: 'Counties Covered' },
                { n: '5', label: 'Vetting Checks' },
                { n: '0', label: 'Lead Fees' },
                { n: '100%', label: 'Vetted Contractors' },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: '14px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    fontSize: 28, fontWeight: 800, letterSpacing: '-1px',
                    color: 'var(--color-text)', lineHeight: 1,
                  }}>{stat.n}</div>
                  <div style={{
                    fontSize: 12, color: 'var(--color-text-muted)',
                    marginTop: 4, fontWeight: 500,
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 56px',
      }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: 'var(--color-blue)',
            whiteSpace: 'nowrap', marginRight: 32,
          }}>
            Verified
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {[
              'PA Contractor License',
              'Insurance on File',
              'W-9 Verified',
              'Experience Checked',
              'External Review Required',
              'Phase 1 — Painting Only',
            ].map((item, i) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: 'var(--color-text-muted)',
                padding: '0 24px',
                borderRight: i < 5 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  backgroundColor: 'var(--color-green)', flexShrink: 0,
                }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PROBLEM / SOLUTION ─── */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '104px 56px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            The Problem
          </div>
          <div style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
            color: 'var(--color-text)',
          }}>
            The way contractors find<br />subs right now is broken.
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 56,
          }}>
            When your regular crew can&apos;t cover a job, the options haven&apos;t changed in decades. And every one of them is a gamble.
          </p>

          {/* Split: two panels side by side */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            {/* Left — red / "today" */}
            <div style={{
              background: 'var(--color-bg-card)',
              padding: '56px 48px',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'var(--color-red)', marginBottom: 24,
              }}>
                How it works today
              </div>
              <ul style={{
                listStyle: 'none', padding: 0, margin: 0,
                display: 'flex', flexDirection: 'column', gap: 18,
              }}>
                {[
                  "Facebook Marketplace — you don't know who you're calling",
                  'Craigslist — no vetting, no accountability',
                  'Google search — pure luck, no verification',
                  'Paint store cards — someone who knows someone',
                  'Word of mouth — limited reach, inconsistent quality',
                ].map(item => (
                  <li key={item} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.5,
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-red)', flexShrink: 0 }}>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — green / TradeSource */}
            <div style={{
              background: 'var(--color-bg-card)',
              padding: '56px 48px',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 24,
              }}>
                How it works on TradeSource
              </div>
              <ul style={{
                listStyle: 'none', padding: 0, margin: 0,
                display: 'flex', flexDirection: 'column', gap: 18,
              }}>
                {[
                  'Every contractor vetted before access — license, insurance, W-9, experience, review',
                  'Post your job at your fixed rate — no one bids below it',
                  'You choose who accepts — based on their profile and history',
                  'Work stays private between the two contractors',
                  'No lead fees. No ads. No algorithm deciding who wins.',
                ].map(item => (
                  <li key={item} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.5,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      backgroundColor: 'var(--color-green-dim)',
                      border: '1px solid var(--color-green-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section style={{ padding: '104px 56px', background: 'var(--color-bg-primary)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            Process
          </div>
          <div style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
            color: 'var(--color-text)',
          }}>
            How TradeSource works.
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 56,
          }}>
            From application to first job in days. No black box, no long wait.
          </p>

          {[
            { n: '01', title: 'Apply', body: 'Submit your business information, contractor license, proof of insurance, W-9, trade experience, and at least one external review.' },
            { n: '02', title: 'We Review Your Application', body: 'Every application is reviewed personally. We verify every document and check that everything is legitimate before you get access.' },
            { n: '03', title: 'Get Approved and Access the Network', body: 'Once approved, you receive an email and create your password. Full access to the network of vetted painting contractors.' },
            { n: '04', title: 'Build Your Scope with AI — Then Post at Your Rate', body: 'When you have work that needs a sub, use our AI Scope Builder to write a complete, professional scope. Post it at your fixed rate — contractors in the network see it and respond.' },
            { n: '05', title: 'Choose Who You Want to Work With', body: "Review profiles, see experience and past work. You decide who gets the job — no algorithm, no bidding, no surprises." },
          ].map((step, i) => (
            <div key={step.n} style={{
              display: 'grid', gridTemplateColumns: '72px 1fr',
              borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none',
              padding: '40px 0',
            }}>
              <div style={{
                fontSize: 56, fontWeight: 900, letterSpacing: '-3px',
                lineHeight: 1, color: 'var(--color-bg-elevated)',
                WebkitTextStroke: '1px var(--color-blue-border)',
                paddingTop: 4,
              }}>
                {step.n}
              </div>
              <div style={{ paddingLeft: 16 }}>
                <div style={{
                  fontSize: 18, fontWeight: 700, marginBottom: 8,
                  letterSpacing: '-0.2px', color: 'var(--color-text)',
                }}>{step.title}</div>
                <div style={{
                  fontSize: 14, color: 'var(--color-text-muted)',
                  lineHeight: 1.7, maxWidth: 520,
                }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '104px 56px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            Why TradeSource is different
          </div>
          <div style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
            color: 'var(--color-text)',
          }}>
            Built around one idea.
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 48,
          }}>
            Contractors should control their own work. Not another lead-gen directory. A private network.
          </p>

          {[
            {
              icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
              title: 'Fixed Price. No Bidding.',
              body: 'You set the rate upfront. No one undercuts your price to get the job. The contractor who gets the work is the one you chose.',
              tag: 'Core mechanic',
            },
            {
              icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
              title: 'Work Stays in Network',
              body: 'Every job is private between the contractor who posted and the contractor who accepts. Your clients, your reputation, your relationships.',
              tag: 'Private',
            },
            {
              icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={1.5}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
              title: 'AI Tools Built for the Work',
              body: 'Most platforms give you a form. TradeSource gives you an AI Scope Builder that turns a few questions into a complete job description — so you miss less and contractors respond better.',
              tag: 'Live now',
              tagColor: '#10b981',
            },
          ].map(item => (
            <div key={item.title} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 24,
              alignItems: 'start',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              padding: '32px 36px', borderRadius: 12, marginBottom: 2,
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-blue-border)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
              <div style={{
                width: 48, height: 48,
                background: 'var(--color-blue-dim)',
                border: '1px solid var(--color-blue-border)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-blue)',
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 480 }}>
                  {item.body}
                </div>
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600,
                background: item.tagColor ? `${item.tagColor}18` : 'var(--color-blue-soft)',
                border: item.tagColor ? `1px solid ${item.tagColor}40` : '1px solid var(--color-blue-border)',
                color: item.tagColor || 'var(--color-blue)',
                padding: '6px 12px', borderRadius: 100,
                whiteSpace: 'nowrap', marginTop: 4,
              }}>
                {item.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─── */}
      <section style={{
        padding: '104px 56px', background: 'var(--color-bg-primary)',
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
            Built for three types of contractors
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 48,
          }}>
            The network works because everyone in it has something to offer and something they need.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
                border: '1px solid var(--color-border)',
                borderRadius: 16, padding: '40px 36px',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-blue-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div style={{
                  position: 'absolute', top: -16, right: 20,
                  fontSize: 120, fontWeight: 900, letterSpacing: '-5px',
                  color: 'var(--color-bg-elevated)',
                  WebkitTextStroke: '1px var(--color-blue-border)',
                  lineHeight: 1, pointerEvents: 'none',
                }}>
                  {card.num}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: 'var(--color-blue)',
                  marginBottom: 12, position: 'relative', zIndex: 1,
                }}>
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
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '104px 56px',
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

      {/* ─── EARLY ACCESS ─── */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '104px 56px',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: 'var(--color-blue)', marginBottom: 20,
          }}>
            Early Access
          </div>
          <div style={{
            fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16,
            color: 'var(--color-text)',
          }}>
            Ready to stop trusting your<br />
            business to <em style={{ fontStyle: 'normal', color: 'var(--color-blue)' }}>random Google searches?</em>
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            marginBottom: 48, lineHeight: 1.7,
          }}>
            TradeSource is opening to a limited number of contractors in Montgomery County, Bucks County, Delaware County, and Philadelphia, PA.
          </p>
          <EarlyAccessForm />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)', padding: '56px',
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
                Private contractor-to-contractor overflow network. Fixed price, no bidding, no lead fees.
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
              2026 TradeSource. All rights reserved. Phase 1 Early Access.
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
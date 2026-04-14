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
        id="homepage-hero"
        data-homepage-hero
        style={{
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background: dark navy gradient on left, subtle reference image on right */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0,
        }}>
          <img
            src="/hero-bg.png"
            alt=""
            style={{
              position: 'absolute', right: 0, top: 0,
              width: '55%', height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(1,5,18,0.92) 0%, rgba(1,5,18,0.72) 40%, rgba(1,5,18,0.35) 62%, transparent 85%)',
          }}/>
        </div>

        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 56px 0', position: 'relative', zIndex: 1 }}>

          {/* Top row: hero content + stats panel */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            alignItems: 'start', gap: 48,
            paddingBottom: 64,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Left — hero content */}
            <div style={{ paddingTop: 8 }}>

              {/* Phase badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(37,99,235,0.12)',
                border: '1px solid rgba(37,99,235,0.3)',
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

              {/* Main headline */}
              <h1 className="hero-headline" style={{
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 900, lineHeight: 1.0,
                letterSpacing: '-2.5px',
                maxWidth: 560, marginBottom: 16,
                color: '#fff',
              }}>
                Vetted Overflow Painting Work — No Lead Fees, No Bidding.
              </h1>

              {/* Subheadline */}
              <p style={{
                fontSize: 16, color: 'rgba(255,255,255,0.65)',
                maxWidth: 520, lineHeight: 1.7,
                marginBottom: 24, letterSpacing: '-0.1px',
              }}>
                TradeSource is a private network of vetted painting contractors in the four-county Philadelphia area. Post your overflow work at your fixed rate — contractors in the network see it, express interest, and you choose who you work with. No bidding, no lead fees, no algorithm deciding who wins.
              </p>

              {/* Trust badge row */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                marginBottom: 32,
              }}>
                {[
                  { label: '5 Vetting Checks', color: 'var(--color-blue)' },
                  { label: '0 Lead Fees', color: '#10b981' },
                  { label: '100% Vetted Contractors', color: '#10b981' },
                  { label: 'Fixed Price Only', color: 'var(--color-blue)' },
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

              {/* CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Primary — dominant */}
                <a href="/apply"
                  style={{
                    background: 'var(--color-blue)', color: '#fff',
                    padding: '14px 28px', borderRadius: 10,
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
                  Apply to Join as a Painter
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                {/* Secondary */}
                <a href="/jobs"
                  style={{
                    background: 'transparent', color: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '14px 22px', borderRadius: 10,
                    fontWeight: 500, fontSize: 14, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'
                    ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
                    ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'
                  }}>
                  Browse Open Jobs
                </a>
              </div>
              <p style={{
                fontSize: 12, color: 'rgba(255,255,255,0.35)',
                marginTop: 10, maxWidth: 380,
                lineHeight: 1.5,
              }}>
                Browse open jobs as a guest. Full access — posting, messaging, and application — requires approval to maintain quality across the network.
              </p>
            </div>

            {/* Right — stats panel */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '32px 28px',
              minWidth: 220,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                marginBottom: 24,
              }}>
                Network at a Glance
              </div>
              {[
                { n: '4', label: 'Counties Covered', color: '#fff' },
                { n: '5', label: 'Vetting Checks', color: 'var(--color-blue)' },
                { n: '0', label: 'Lead Fees', color: '#10b981' },
                { n: '100%', label: 'Vetted Contractors', color: '#10b981' },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    fontSize: 26, fontWeight: 800, letterSpacing: '-1px',
                    color: stat.color, lineHeight: 1,
                  }}>{stat.n}</div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.4)',
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

      {/* ─── WHY TRADESOURCE / VALUE PROPS ─── */}
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
            How it works
          </div>
          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900,
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16,
            color: 'var(--color-text)', maxWidth: 600,
          }}>
            The network puts you in control of every job.
          </div>
          <p style={{
            fontSize: 16, color: 'var(--color-text-muted)',
            maxWidth: 520, lineHeight: 1.7, marginBottom: 56,
          }}>
            Post your overflow at your fixed rate. Contractors in the network express interest. You choose who you work with. No bidding, no lead fees, no algorithm deciding who wins.
          </p>

          {/* Value props: three cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                title: 'Fixed Price. No Bidding.',
                desc: 'You set the rate upfront. No one bids below it to undercut your price. The contractor who gets the work is the one you chose — not the one who guessed lowest.',
              },
              {
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: 'Work Stays Private',
                desc: 'Every job is private between the contractor who posts and the contractor who accepts. Your clients, your reputation, your relationships — no public directory, no ads.',
              },
              {
                icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={1.75}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                title: 'Every Contractor Vetted Before Access',
                desc: 'PA license, insurance, W-9, trade experience, and external review — all verified personally before anyone gets access to the network.',
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
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div style={{
                  width: 48, height: 48,
                  background: 'var(--color-blue-dim)',
                  border: '1px solid var(--color-blue-border)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-blue)', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)', letterSpacing: '-0.2px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 480 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
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
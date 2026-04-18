'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/app/theme-toggle'
import { trackClick } from '@/lib/analytics'

// ─── Responsive hook ────────────────────────────────────────────────────

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

// ─── Nav ───────────────────────────────────────────────────────────────

function HomepageNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const width = useWindowWidth()
  const isMobile = (width ?? 1024) <= 820
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])

  return (
    <>
      <header
        className={`ts-nav ${scrolled ? 'is-scrolled' : ''}`}
        data-mobile={isMobile ? 'true' : 'false'}
      >
        <div className="ts-nav-inner">
          <a href="/" className="ts-nav-brand">
            Trade<span>Source</span>
          </a>

          {!isMobile && (
            <nav className="ts-nav-links">
              <a href="/jobs" className={pathname?.startsWith('/jobs') ? 'is-active' : ''}>Browse jobs</a>
              <a href="/apply" className={pathname?.startsWith('/apply') ? 'is-active' : ''}>Apply</a>
              <a href="/signin">Sign in</a>
            </nav>
          )}

          <div className="ts-nav-actions">
            {!isMobile && (
              <a href="/apply"
                 onClick={() => trackClick('apply_for_access', 'nav_primary')}
                 className="ts-nav-cta">
                Apply for access
              </a>
            )}
            <ThemeToggle />
            {isMobile && (
              <button
                onClick={() => setMobileOpen(o => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="ts-nav-hamburger"
              >
                {mobileOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {isMobile && mobileOpen && (
        <div className="ts-nav-drawer">
          <a href="/jobs">Browse jobs</a>
          <a href="/apply">Apply</a>
          <a href="/signin">Sign in</a>
          <a href="/apply" className="ts-nav-drawer-cta">Apply for access</a>
        </div>
      )}
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="ts-home">
      <HomepageNav />

      {/* ═══════════════════════════════════════════════════════════
          HERO — big type, dark, confident, restrained
         ═══════════════════════════════════════════════════════════ */}
      <section className="ts-hero">
        <div className="ts-hero-bg" aria-hidden="true">
          <div className="ts-hero-glow ts-hero-glow-1" />
          <div className="ts-hero-glow ts-hero-glow-2" />
          <div className="ts-hero-grid" />
        </div>

        <div className="ts-hero-inner">
          <div className="ts-hero-label">
            <span className="ts-hero-label-rule" />
            Phase 1 · Painting · Greater Philadelphia
          </div>

          <h1 className="ts-hero-title">
            A private network<br />
            for <em>overflow painting</em> work.
          </h1>

          <p className="ts-hero-sub">
            Vetted contractors share overflow at a fixed rate. No bidding, no lead fees, approved members only.
          </p>

          <div className="ts-hero-actions">
            <a href="/apply"
               onClick={() => trackClick('apply_for_access', 'hero_primary')}
               className="ts-cta-primary">
              Apply for access
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </a>
            <a href="/jobs"
               onClick={() => trackClick('browse_jobs_first', 'hero_secondary')}
               className="ts-cta-ghost">
              Browse open jobs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="ts-hero-foot">
          <div className="ts-hero-inner">
            <div className="ts-hero-verify">
              <span className="ts-hero-verify-label">Verified before access</span>
              <div className="ts-hero-verify-items">
                <span>PA license</span>
                <span>Insurance</span>
                <span>W-9</span>
                <span>Experience</span>
                <span>External review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — 3 rows, hairline dividers, big numbers
         ═══════════════════════════════════════════════════════════ */}
      <section className="ts-section ts-section-light">
        <div className="ts-section-inner">
          <header className="ts-section-head">
            <div className="ts-section-kicker">How it works</div>
            <h2 className="ts-section-title">Three steps to your next network job.</h2>
          </header>

          <div className="ts-steps">
            {[
              {
                n: '01',
                title: 'Apply for access.',
                desc: 'Submit your PA license, insurance, W-9, experience, and an external review. Every application is reviewed by a real person.',
              },
              {
                n: '02',
                title: 'Post overflow at your rate.',
                desc: 'Once approved, post the work at your fixed price. An AI scope builder helps you write a clean, complete scope in seconds.',
              },
              {
                n: '03',
                title: 'Choose who does the work.',
                desc: 'Vetted contractors express interest. Review their profile and history, then award the job directly. No bidding, no surprises.',
              },
            ].map(s => (
              <article key={s.n} className="ts-step">
                <div className="ts-step-num">{s.n}</div>
                <div className="ts-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHO IT'S FOR — dark section, same typographic treatment
         ═══════════════════════════════════════════════════════════ */}
      <section className="ts-section ts-section-dark">
        <div className="ts-section-inner">
          <header className="ts-section-head">
            <div className="ts-section-kicker">Who it's for</div>
            <h2 className="ts-section-title">Built for three kinds of painters.</h2>
          </header>

          <div className="ts-who">
            {[
              {
                tag: 'Overflow',
                title: 'More work than your crew can finish.',
                body: 'You landed the job. You need reliable help. Post it at your rate, keep the customer, move on.',
              },
              {
                tag: 'Subs',
                title: 'A solid painter looking for steady work.',
                body: 'You show up, you do it right. TradeSource puts you inside a network of vetted contractors who need exactly what you offer.',
              },
              {
                tag: 'Next-gen',
                title: 'An operator who sells without a crew.',
                body: 'You close the job. You don\'t want to manage a crew. Post the work, find the right sub, fulfill what you sold.',
              },
            ].map(c => (
              <article key={c.tag} className="ts-who-item">
                <div className="ts-who-tag">{c.tag}</div>
                <h3 className="ts-who-title">{c.title}</h3>
                <p className="ts-who-body">{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUST — numbered spec list, no icons, no cards
         ═══════════════════════════════════════════════════════════ */}
      <section className="ts-section ts-section-light">
        <div className="ts-section-inner">
          <div className="ts-trust-layout">
            <header className="ts-trust-head">
              <div className="ts-section-kicker">Trust</div>
              <h2 className="ts-section-title">What <em>verified</em> actually means.</h2>
              <p className="ts-section-lede">
                Every contractor clears five checks before they can post, browse, or respond to work on the network.
              </p>
            </header>

            <ol className="ts-trust-list">
              {[
                { title: 'PA contractor license', body: 'License number verified against Pennsylvania state records.' },
                { title: 'Proof of insurance', body: 'Current certificate of insurance on file. No insurance, no access.' },
                { title: 'W-9 on file', body: 'Business identity and tax information confirmed before approval.' },
                { title: 'Trade experience', body: 'Documented work history in painting — not just a license on paper.' },
                { title: 'External review', body: 'At least one real review from Google, Houzz, Angi, or an equivalent source.' },
              ].map((item, i) => (
                <li key={item.title} className="ts-trust-row">
                  <span className="ts-trust-index">{String(i + 1).padStart(2, '0')}</span>
                  <div className="ts-trust-content">
                    <div className="ts-trust-title">{item.title}</div>
                    <div className="ts-trust-body">{item.body}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CLOSING — symmetric to hero, dark, one action
         ═══════════════════════════════════════════════════════════ */}
      <section className="ts-closing">
        <div className="ts-closing-bg" aria-hidden="true">
          <div className="ts-hero-glow ts-hero-glow-1" />
        </div>
        <div className="ts-section-inner ts-closing-inner">
          <h2 className="ts-closing-title">
            Your next job is in the network.
          </h2>
          <p className="ts-closing-sub">
            Phase 1 is open to painting contractors in Philadelphia, Montgomery, Bucks, and Delaware counties.
          </p>
          <div className="ts-hero-actions">
            <a href="/apply"
               onClick={() => trackClick('apply_for_access', 'closing_cta')}
               className="ts-cta-primary">
              Apply for access
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </a>
            <a href="/jobs"
               onClick={() => trackClick('browse_jobs', 'closing_cta')}
               className="ts-cta-ghost">
              Browse open jobs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </a>
          </div>
          <div className="ts-closing-contact">
            Questions? <a href="mailto:info@tradesource.app">info@tradesource.app</a>
          </div>
        </div>
      </section>
    </div>
  )
}

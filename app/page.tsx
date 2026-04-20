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

// ─── Floating Premium Nav ──────────────────────────────────────────────

function HomepageNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const width = useWindowWidth()
  const isMobile = (width ?? 1024) <= 820
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])

  return (
    <>
      <header className={`ts-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="ts-nav-inner">
          <a href="/" className="ts-nav-brand">Trade<span>Source</span></a>
          {!isMobile && (
            <nav className="ts-nav-links">
              <a href="/jobs" className={pathname?.startsWith('/jobs') ? 'is-active' : ''}>Browse jobs</a>
              <a href="/signin">Sign in</a>
            </nav>
          )}
          <div className="ts-nav-actions">
            {!isMobile && (
              <a href="/apply"
                 onClick={() => trackClick('apply_for_access', 'nav_primary')}
                 className="ts-nav-cta">Apply for access</a>
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
          <a href="/signin">Sign in</a>
          <a href="/apply" className="ts-nav-drawer-cta">Apply for access</a>
        </div>
      )}
    </>
  )
}

// ─── Mockup building blocks ────────────────────────────────────────────

function MockWindowChrome({ title }: { title: string }) {
  return (
    <div className="mk-chrome">
      <div className="mk-dots"><span/><span/><span/></div>
      <div className="mk-chrome-title">{title}</div>
    </div>
  )
}

// Mockup A — Jobs feed (hero)
function MockJobsFeed() {
  const jobs = [
    { title: 'Interior repaint · 2,400 sq ft', loc: 'Bucks County, PA', price: '$3,200', interested: 3, tag: 'New' },
    { title: 'Exterior trim & doors', loc: 'Montgomery County, PA', price: '$1,850', interested: 5 },
    { title: 'Whole-home refresh', loc: 'Philadelphia, PA', price: '$6,400', interested: 2 },
  ]
  return (
    <div className="mk-frame">
      <MockWindowChrome title="TradeSource · Open jobs" />
      <div className="mk-body">
        <div className="mk-toolbar">
          <div className="mk-chip mk-chip-active">All jobs</div>
          <div className="mk-chip">Interior</div>
          <div className="mk-chip">Exterior</div>
          <div className="mk-chip">Commercial</div>
          <div className="mk-spacer"/>
          <div className="mk-search">Search jobs…</div>
        </div>
        <div className="mk-jobs">
          {jobs.map((j, i) => (
            <div key={i} className="mk-job">
              <div className="mk-job-main">
                <div className="mk-job-top">
                  <div className="mk-job-title">{j.title}</div>
                  {j.tag && <span className="mk-pill mk-pill-new">{j.tag}</span>}
                </div>
                <div className="mk-job-meta">
                  <span>{j.loc}</span>
                  <span className="mk-dot"/>
                  <span>Fixed price</span>
                  <span className="mk-dot"/>
                  <span>{j.interested} interested</span>
                </div>
              </div>
              <div className="mk-job-price">{j.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mockup B — Post-job flow
function MockPostJob() {
  return (
    <div className="mk-frame">
      <MockWindowChrome title="Post overflow work" />
      <div className="mk-body mk-body-tight">
        <div className="mk-field">
          <div className="mk-label">Trade</div>
          <div className="mk-input">Interior painting</div>
        </div>
        <div className="mk-row-2">
          <div className="mk-field">
            <div className="mk-label">Location</div>
            <div className="mk-input">Doylestown, PA 18901</div>
          </div>
          <div className="mk-field">
            <div className="mk-label">Your fixed price</div>
            <div className="mk-input mk-input-price">$3,200</div>
          </div>
        </div>
        <div className="mk-field">
          <div className="mk-label">Scope</div>
          <div className="mk-input mk-input-tall">
            Full interior repaint of 2,400 sq ft single-family home. Walls, ceilings, baseboards. Two coats premium latex.
          </div>
        </div>
        <div className="mk-footer">
          <div className="mk-hint">Visible only to approved network contractors</div>
          <div className="mk-btn mk-btn-primary">Post job →</div>
        </div>
      </div>
    </div>
  )
}

// Mockup C — Interested contractors
function MockInterests() {
  const subs = [
    { name: 'Joe Martinez', exp: '15 yrs', rating: '4.9', count: 37, state: 'verified' },
    { name: 'Alicia Reyes', exp: '9 yrs', rating: '4.8', count: 22, state: 'verified' },
    { name: 'Marcus Kim', exp: '12 yrs', rating: '5.0', count: 18, state: 'verified' },
  ]
  return (
    <div className="mk-frame">
      <MockWindowChrome title="3 contractors interested" />
      <div className="mk-body mk-body-tight">
        {subs.map((s, i) => (
          <div key={i} className="mk-sub">
            <div className="mk-avatar" data-name={s.name.split(' ').map(p => p[0]).join('')}>{s.name.split(' ').map(p => p[0]).join('')}</div>
            <div className="mk-sub-main">
              <div className="mk-sub-name">{s.name}</div>
              <div className="mk-sub-meta">
                <span>{s.exp}</span>
                <span className="mk-dot"/>
                <span>★ {s.rating}</span>
                <span className="mk-dot"/>
                <span>{s.count} jobs</span>
              </div>
            </div>
            <div className="mk-verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Verified
            </div>
            <div className={`mk-btn ${i === 0 ? 'mk-btn-primary' : 'mk-btn-ghost'}`}>{i === 0 ? 'Award' : 'View'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mockup D — Verified profile
function MockVerifiedProfile() {
  const checks = [
    { label: 'PA contractor license', detail: 'PA #HIC-046281' },
    { label: 'Proof of insurance', detail: 'Expires 04/2027' },
    { label: 'W-9 on file', detail: 'Verified' },
    { label: 'Trade experience', detail: '15 yrs · painting' },
    { label: 'External review', detail: '4.9 · Google (52)' },
  ]
  return (
    <div className="mk-frame">
      <MockWindowChrome title="Contractor profile" />
      <div className="mk-body mk-body-tight">
        <div className="mk-profile-head">
          <div className="mk-avatar mk-avatar-lg">JM</div>
          <div>
            <div className="mk-profile-name">Joe Martinez</div>
            <div className="mk-profile-meta">Martinez Painting · Doylestown, PA</div>
          </div>
          <div className="mk-verified-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Verified
          </div>
        </div>
        <div className="mk-checks">
          {checks.map((c, i) => (
            <div key={i} className="mk-check">
              <div className="mk-check-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="mk-check-label">{c.label}</div>
              <div className="mk-check-detail">{c.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mockup E — AI Scope Builder
function MockScopeBuilder() {
  return (
    <div className="mk-frame">
      <MockWindowChrome title="AI Scope Builder" />
      <div className="mk-body mk-body-tight">
        <div className="mk-row-2">
          <div className="mk-field"><div className="mk-label">Property</div><div className="mk-input">Single-family</div></div>
          <div className="mk-field"><div className="mk-label">Area</div><div className="mk-input">2,400 sq ft</div></div>
        </div>
        <div className="mk-row-2">
          <div className="mk-field"><div className="mk-label">Surfaces</div><div className="mk-input">Walls, ceilings, trim</div></div>
          <div className="mk-field"><div className="mk-label">Coats</div><div className="mk-input">2 · premium latex</div></div>
        </div>
        <div className="mk-ai-output">
          <div className="mk-ai-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/></svg>
            AI generated scope
          </div>
          <div className="mk-ai-text">
            Full interior repaint of 2,400 sq ft single-family home. Walls, ceilings, and baseboards in eggshell finish. Two coats premium latex throughout. All surfaces patched, sanded, and primed prior to coating. Trim in semi-gloss. Owner selects paint color. All materials and labor included.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Aurora gradient panel wrapper ─────────────────────────────────────

function AuroraPanel({ children, tint = 'blue' }: { children: React.ReactNode, tint?: 'blue' | 'teal' | 'violet' }) {
  return (
    <div className={`ts-aurora ts-aurora-${tint}`}>
      <div className="ts-aurora-glow-a" aria-hidden="true"/>
      <div className="ts-aurora-glow-b" aria-hidden="true"/>
      <div className="ts-aurora-grain" aria-hidden="true"/>
      <div className="ts-aurora-content">{children}</div>
    </div>
  )
}

// ─── Sections ──────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="ts-hero">
      <div className="ts-hero-wash" aria-hidden="true"/>
      <div className="ts-hero-inner">
        <div className="ts-hero-kicker">Phase 1 · Greater Philadelphia</div>
        <h1 className="ts-hero-title">
          A private network<br/>for overflow painting.
        </h1>
        <p className="ts-hero-sub">
          Vetted contractors share overflow work at fixed rates. No bidding, no lead fees.
        </p>
        <div className="ts-hero-cta">
          <a href="/apply"
             onClick={() => trackClick('apply_for_access', 'hero_primary')}
             className="ts-cta-primary">
            Apply for access
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>

      {/* Product screenshot below the hero — Codex spec */}
      <div className="ts-hero-shot">
        <AuroraPanel tint="blue">
          <MockJobsFeed/>
        </AuroraPanel>
      </div>
    </section>
  )
}

function CoverageStrip() {
  return (
    <section className="ts-coverage">
      <div className="ts-coverage-inner">
        <span className="ts-coverage-label">Phase 1 coverage</span>
        <span className="ts-coverage-item">Philadelphia</span>
        <span className="ts-coverage-item">Montgomery</span>
        <span className="ts-coverage-item">Bucks</span>
        <span className="ts-coverage-item">Delaware</span>
        <span className="ts-coverage-divider"/>
        <span className="ts-coverage-item">Licensed</span>
        <span className="ts-coverage-item">Insured</span>
        <span className="ts-coverage-item">Verified</span>
      </div>
    </section>
  )
}

function StorySection({
  title, body, mockup, tint, reverse,
}: {
  kicker?: string
  title: React.ReactNode
  body: string
  mockup: React.ReactNode
  tint?: 'blue' | 'teal' | 'violet'
  reverse?: boolean
}) {
  return (
    <section className={`ts-story ts-story-${tint ?? 'blue'} ${reverse ? 'is-reverse' : ''}`}>
      <div className="ts-story-atmosphere" aria-hidden="true"/>
      <div className="ts-story-inner">
        <div className="ts-story-copy">
          <h2 className="ts-story-title">{title}</h2>
          <p className="ts-story-body">{body}</p>
        </div>
        <div className="ts-story-visual">
          <AuroraPanel tint={tint ?? 'blue'}>{mockup}</AuroraPanel>
        </div>
      </div>
    </section>
  )
}

function ClosingSection() {
  return (
    <section className="ts-closing-v2">
      <div className="ts-closing-wash" aria-hidden="true"/>
      <div className="ts-closing-inner">
        <h2 className="ts-closing-title">Your next job is in the network.</h2>
        <p className="ts-closing-sub">
          Phase 1 is open to painting contractors in Philadelphia, Montgomery, Bucks, and Delaware counties.
        </p>
        <a href="/apply"
           onClick={() => trackClick('apply_for_access', 'closing_cta')}
           className="ts-cta-primary">
          Apply for access
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <div className="ts-closing-contact">Questions? <a href="mailto:info@tradesource.app">info@tradesource.app</a></div>
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="ts-home">
      <HomepageNav/>
      <HeroSection/>

      <StorySection
        title={<>Post overflow <em>at your rate</em>.</>}
        body="You set the price. No bidding, no lead fees. Your scope reaches a private network of vetted painting contractors — not the open internet."
        mockup={<MockPostJob/>}
        tint="blue"
      />

      <StorySection
        title={<>See who's <em>interested</em>, then choose.</>}
        body="Approved contractors express interest at your price. Review their profile, experience, and reviews. Award directly. No surprises."
        mockup={<MockInterests/>}
        tint="teal"
        reverse
      />

      <StorySection
        title={<>Verified <em>before</em> access.</>}
        body="Every contractor clears five checks before they can post, browse, or respond to work. License, insurance, W-9, documented trade experience, and an external review."
        mockup={<MockVerifiedProfile/>}
        tint="violet"
      />

      <StorySection
        title={<>An <em>AI scope builder</em> writes the clean scope.</>}
        body="Describe the job in plain language. TradeSource writes a complete, professional scope contractors can actually use. Fewer missed items. Fewer callbacks. Faster quotes."
        mockup={<MockScopeBuilder/>}
        tint="blue"
        reverse
      />

      <ClosingSection/>
    </div>
  )
}

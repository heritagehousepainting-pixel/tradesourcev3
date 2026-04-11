'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useUserAccess } from '@/lib/auth/access.client'
import { signOut } from '@/lib/auth/client'
import type { UserAccess } from '@/lib/auth/access.types'
import { ThemeToggle } from '@/app/theme-toggle'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// ─── Responsive hook ─────────────────────────────────────────────────────────────

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

// ─── Context value ───────────────────────────────────────────────────────────

interface NavContextValue {
  access: UserAccess
  handleSignOut: () => Promise<void>
}

const NavContext = createContext<NavContextValue | null>(null)

export function useNavContext(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) {
    throw new Error('useNavContext must be used within NavProvider')
  }
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function NavProvider({ children }: { children: React.ReactNode }) {
  const access = useUserAccess()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <NavContext.Provider value={{ access, handleSignOut }}>
      {children}
    </NavContext.Provider>
  )
}

// ─── LayoutHeader ─────────────────────────────────────────────────────────────

/**
 * Sticky site header — the single nav bar for the entire app.
 *
 * Renders one of two nav variants based on canonical UserAccess:
 *
 *  NOT AUTHENTICATED  →  PUBLIC NAV: Browse Jobs · Apply · Sign In
 *  AUTHENTICATED     →  APP NAV: Browse Jobs · [Post a Job if vetted] · Dashboard
 *                       [Application Portal if founder]
 *
 * The PUBLIC NAV variant is shown on the homepage for ALL visitors (guest or
 * signed-in) as a design choice — the homepage is always a public landing page.
 * Once the user navigates to any other page, the APP NAV variant shows for
 * authenticated users.
 *
 * Loading state: nothing renders until access.check completes, preventing
 * a flash of the wrong nav variant.
 *
 * Responsive: desktop shows full nav links; mobile (≤640px) shows hamburger
 * menu with a slide-down drawer containing all links stacked vertically.
 */
export function LayoutHeader() {
  const { access, handleSignOut } = useNavContext()
  const pathname = usePathname()

  // Never render LayoutHeader on the homepage — HomepageNav in page.tsx handles it
  if (pathname === '/') return null

  // Don't render anything until auth state is resolved.
  // This prevents a flash of the wrong nav variant.
  if (!access.checked) {
    return (
      <header
        style={{
          backgroundColor: 'var(--color-nav)',
          borderBottom: '1px solid var(--color-nav-border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: 60,
        }}
      />
    )
  }

  const showPublicNav = !access.isAuthenticated
  const width = useWindowWidth()
  const isMobile = (width ?? 1024) <= 640

  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header
      style={{
        backgroundColor: 'var(--color-nav)',
        borderBottom: '1px solid var(--color-nav-border)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
          }}
        >
          {/* ─ Brand ─ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: 'var(--color-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              TradeSource
            </Link>
          </div>

          {/* ─ Desktop nav ─ */}
          {!isMobile && (
            <>
              {showPublicNav && (
                <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <NavLink href="/jobs">Browse Jobs</NavLink>
                  <NavLink href="/apply">Apply</NavLink>
                  <NavLink href="/founder-login" button>Sign In</NavLink>
                  <ThemeToggle />
                </nav>
              )}
              {!showPublicNav && (
                <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <NavLink href={access.vettingStatus === 'approved' ? '/dashboard?view=browse' : '/jobs'}>Browse Jobs</NavLink>
                  {access.canPostJobs && <NavLink href="/post-job">Post a Job</NavLink>}
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  {access.canViewApplicationPortal && <NavLink href="/admin" muted>Application Portal</NavLink>}
                  <button onClick={handleSignOut} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign Out</button>
                  <ThemeToggle />
                </nav>
              )}
            </>
          )}

          {/* ─ Mobile: theme toggle + hamburger ─ */}
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
        </div>
      </div>

      {/* ─ Mobile dropdown drawer ─ */}
      {isMobile && mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--color-nav-border)',
          backgroundColor: 'var(--color-nav)',
          padding: '8px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {showPublicNav ? (
            <>
              <MobileLink href="/jobs" onClick={() => setMobileOpen(false)}>Browse Jobs</MobileLink>
              <MobileLink href="/apply" onClick={() => setMobileOpen(false)}>Apply</MobileLink>
              <MobileLink href="/founder-login" onClick={() => setMobileOpen(false)}>Sign In</MobileLink>
            </>
          ) : (
            <>
              <MobileLink href={access.vettingStatus === 'approved' ? '/dashboard?view=browse' : '/jobs'} onClick={() => setMobileOpen(false)}>Browse Jobs</MobileLink>
              {access.canPostJobs && <MobileLink href="/post-job" onClick={() => setMobileOpen(false)}>Post a Job</MobileLink>}
              <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              {access.canViewApplicationPortal && <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>Application Portal</MobileLink>}
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false) }}
                style={{
                  fontSize: 14, fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', padding: '12px 0',
                  minHeight: 44,
                  borderBottom: '1px solid var(--color-nav-border)',
                  display: 'block', width: '100%',
                }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'block', padding: '12px 0', fontSize: 14, fontWeight: 500,
      color: 'var(--color-text)', textDecoration: 'none', minHeight: 44,
      borderBottom: '1px solid var(--color-nav-border)',
    }}>
      {children}
    </Link>
  )
}

// ─── NavLink helper ────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string
  button?: boolean
  muted?: boolean
  children: React.ReactNode
}

function NavLink({ href, button, muted, children }: NavLinkProps) {
  const base: React.CSSProperties = button
    ? {
        fontSize: 13,
        fontWeight: 600,
        padding: '7px 14px',
        borderRadius: 8,
        backgroundColor: 'var(--color-blue)',
        color: '#fff',
        textDecoration: 'none',
      }
    : {
        fontSize: 13,
        fontWeight: 500,
        color: muted ? 'var(--color-text)' : 'var(--color-text)',
        textDecoration: 'none',
        opacity: muted ? 0.65 : 0.85,
        transition: 'opacity 0.15s',
      }

  return (
    <Link
      href={href}
      style={base as any}
      onMouseEnter={
        !button
          ? (e: any) => (e.currentTarget.style.opacity = '1')
          : undefined
      }
      onMouseLeave={
        !button && !muted
          ? (e: any) => (e.currentTarget.style.opacity = '0.85')
          : muted
          ? (e: any) => (e.currentTarget.style.opacity = '0.65')
          : undefined
      }
    >
      {children}
    </Link>
  )
}

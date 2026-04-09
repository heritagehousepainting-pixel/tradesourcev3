'use client'

/**
 * NavContext — thin context wrapper around the canonical useUserAccess() hook.
 *
 * All nav and shell decisions flow through this context.
 * The actual auth logic lives in @/lib/auth/access.ts (useUserAccess).
 * NavContext exists so LayoutHeader can access state without prop-drilling.
 *
 * Usage:
 *   const { access, handleSignOut } = useNavContext()
 *   const access = useNavContext()  // read-only
 *
 * For pages/components that don't need the context, import useUserAccess directly:
 *   import { useUserAccess } from '@/lib/auth/access'
 */

import { createContext, useContext } from 'react'
import { useUserAccess } from '@/lib/auth/access.client'
import { signOut } from '@/lib/auth/client'
import type { UserAccess } from '@/lib/auth/access.types'
import { ThemeToggle } from '@/app/theme-toggle'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Context value ───────────────────────────────────────────────────────────

interface NavContextValue {
  /** The canonical access object — use this for all nav/shell decisions */
  access: UserAccess
  /** Sign out — clears the Supabase session from cookies */
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

/**
 * @deprecated Use useNavContext() instead. This alias exists only to avoid
 * breaking existing imports during the nav refactor step.
 *
 * OLD shape: { isSignedIn, isVetted, user, handleSignOut }
 * NEW shape: { access: UserAccess, handleSignOut }
 *
 * Migrate usages in app/profile/page.tsx and components/ProfileSection.tsx
 * to use const { access, handleSignOut } = useNavContext()
 * then access.isAuthenticated, access.vettingStatus, access.profile.
 */
export function useNavVariant(): {
  isSignedIn: boolean
  isVetted: boolean
  user: any
  handleSignOut: () => Promise<void>
} {
  const { access, handleSignOut } = useNavContext()
  return {
    isSignedIn: access.isAuthenticated,
    isVetted: access.vettingStatus === 'approved',
    user: access.profile ?? (access.email ? { email: access.email } : null),
    handleSignOut,
  }
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
 */
export function LayoutHeader() {
  const { access, handleSignOut } = useNavContext()
  const pathname = usePathname()

  // Don't render anything until auth state is resolved.
  // This prevents a flash of the public nav when the user is actually signed in.
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

  const isHomepage = pathname === '/'
  const showPublicNav = isHomepage || !access.isAuthenticated

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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <Link
              href="/"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-text)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              TradeSource
            </Link>
          </div>

          {/* ─ PUBLIC NAV — homepage OR signed-out visitors ─ */}
          {showPublicNav && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <NavLink href="/jobs">Browse Jobs</NavLink>
              <NavLink href="/apply">Apply</NavLink>
              <NavLink
                href="/founder-login"
                button
              >
                Sign In
              </NavLink>
              <ThemeToggle />
            </nav>
          )}

          {/* ─ APP NAV — authenticated users (non-homepage) ─ */}
          {!showPublicNav && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Browse Jobs — vetted contractors use the dashboard browse view */}
              <NavLink
                href={access.vettingStatus === 'approved' ? '/dashboard?view=browse' : '/jobs'}
              >
                Browse Jobs
              </NavLink>

              {/* Post a Job — vetted only */}
              {access.canPostJobs && (
                <NavLink href="/post-job">Post a Job</NavLink>
              )}

              {/* Dashboard — all authenticated users */}
              <NavLink href="/dashboard">Dashboard</NavLink>

              {/* Application Portal — founder only */}
              {access.canViewApplicationPortal && (
                <NavLink href="/admin" muted>
                  Application Portal
                </NavLink>
              )}

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.color = 'var(--color-text)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.color = 'var(--color-text-muted)')
                }
              >
                Sign Out
              </button>

              <ThemeToggle />
            </nav>
          )}
        </div>
      </div>
    </header>
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
        color: muted
          ? 'var(--color-text)'
          : 'var(--color-text)',
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

'use client'

/**
 * Footer navigation — site-wide footer links.
 *
 * Uses canonical useUserAccess() for auth state instead of its own auth logic.
 * Nav links adjust based on whether the user is signed in and their vetting status.
 */

import { useUserAccess } from '@/lib/auth/access.client'

export default function FooterNav() {
  const access = useUserAccess()

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* ── Always shown (public links) ── */}
      <FooterLink href="/jobs">Browse Jobs</FooterLink>
      <FooterLink href="/apply">Apply</FooterLink>

      {/* ── Post a Job — vetted contractors only ── */}
      {access.canPostJobs && (
        <FooterLink href="/post-job">Post a Job</FooterLink>
      )}

      {/* ── Authenticated nav items ── */}
      {access.isAuthenticated ? (
        <>
          <FooterLink href="/dashboard" bold>Dashboard</FooterLink>
          {access.canViewApplicationPortal && (
            <FooterLink href="/admin" muted>Application Portal</FooterLink>
          )}
        </>
      ) : (
        <>
          {/* Show "Sign In" for guests — links to the founder-login page */}
          <FooterLink href="/founder-login" blue>Sign In</FooterLink>
        </>
      )}
    </nav>
  )
}

// ─── FooterLink helper ────────────────────────────────────────────────────────

interface FooterLinkProps {
  href: string
  bold?: boolean
  muted?: boolean
  blue?: boolean
  children: React.ReactNode
}

function FooterLink({ href, bold, muted, blue, children }: FooterLinkProps) {
  const color = blue
    ? 'rgba(59,130,246,0.9)'
    : muted
    ? 'rgba(248,250,252,0.55)'
    : 'rgba(248,250,252,0.85)'

  return (
    <a
      href={href}
      style={{
        fontSize: 13,
        color,
        fontWeight: bold ? 600 : 400,
        textDecoration: 'none',
        transition: 'color 0.15s',
        width: 'fit-content',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.color = blue ? '#2563EB' : 'rgba(248,250,252,1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.color = color
      }}
    >
      {children}
    </a>
  )
}

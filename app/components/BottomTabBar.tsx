'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavContext } from './NavContext'

interface Tab {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export function BottomTabBar() {
  const { access } = useNavContext()
  const pathname = usePathname()

  // Add bottom padding to page body on mobile when tab bar is shown
  useEffect(() => {
    if (typeof document === 'undefined') return
    const applyPadding = () => {
      if (window.innerWidth <= 640 && access.isAuthenticated) {
        document.body.style.paddingBottom = '60px'
      } else {
        document.body.style.paddingBottom = ''
      }
    }
    applyPadding()
    window.addEventListener('resize', applyPadding)
    return () => window.removeEventListener('resize', applyPadding)
  }, [access.isAuthenticated])

  // Only show for authenticated users on mobile (≤640px)
  if (!access.isAuthenticated || !access.checked) return null

  const tabs: Tab[] = [
    {
      href: '/jobs',
      label: 'Jobs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      ),
    },
    {
      href: '/post-job',
      label: 'Post',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/jobs') return pathname === '/jobs' || pathname.startsWith('/jobs/')
    if (href === '/post-job') return pathname === '/post-job'
    if (href === '/messages') return pathname === '/messages'
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        display: 'none', // hidden by default
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-nav)',
        borderTop: '1px solid var(--color-nav-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      className="bottom-tab-bar"
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        height: 50,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {tabs.map(tab => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textDecoration: 'none',
                color: active ? 'var(--color-blue)' : 'var(--color-text-muted)',
                transition: 'color 0.15s',
                padding: '8px 4px',
                borderTop: active ? '2.5px solid var(--color-blue)' : '2.5px solid transparent',
                marginTop: '-1px',
              }}
            >
              <div style={{ position: 'relative' }}>
                {tab.icon}
                {tab.badge && tab.badge > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-blue)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.01em',
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

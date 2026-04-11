'use client'
import { useTheme } from './theme-context'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 8,
        border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.14)',
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.15s, border-color 0.15s',
        padding: 0,
      }}
      onMouseEnter={e => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.backgroundColor = isDark
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.backgroundColor = isDark
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.04)'
      }}
    >
      {isDark ? (
        /* Sun icon — light mode (for when in dark mode, clicking goes to light) */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon icon — dark mode (for when in light mode, clicking goes to dark) */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
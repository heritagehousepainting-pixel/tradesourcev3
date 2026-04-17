'use client'

import React from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'surface' | 'danger' | 'success' | 'warning'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  shadow?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-blue)',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  surface: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    backgroundColor: 'var(--color-red)',
    color: '#fff',
    border: 'none',
  },
  success: {
    backgroundColor: 'var(--color-green)',
    color: '#fff',
    border: 'none',
  },
  warning: {
    backgroundColor: '#F59E0B',
    color: '#fff',
    border: 'none',
  },
}

export default function Button({
  variant = 'primary',
  loading = false,
  shadow = true,
  fullWidth = false,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.6 : 1,
    transition: 'background 0.2s, box-shadow 0.2s, border-color 0.2s',
    ...variantStyles[variant],
    ...(fullWidth ? { width: '100%' } : {}),
    ...(shadow && !loading ? { boxShadow: '0 4px 14px rgba(0,0,0,0.08)' } : { boxShadow: 'none' }),
    ...style,
  }

  const hoverBase: Record<ButtonVariant, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--color-blue-hover)', boxShadow: '0 6px 18px rgba(37,99,235,0.35)' },
    danger: { backgroundColor: '#DC2626', boxShadow: '0 6px 18px rgba(239,68,68,0.35)' },
    success: { backgroundColor: '#047857', boxShadow: '0 6px 18px rgba(16,185,129,0.35)' },
    warning: { backgroundColor: '#D97706', boxShadow: '0 6px 18px rgba(245,158,11,0.35)' },
    ghost: { backgroundColor: 'var(--color-border)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' },
    surface: { backgroundColor: 'var(--color-border)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' },
  }

  return (
    <button
      {...props}
      disabled={loading || disabled}
      style={base}
      onMouseEnter={e => {
        if (!loading && !disabled) {
          const el = e.currentTarget
          const h = hoverBase[variant]
          Object.assign(el.style, h)
        }
        if (typeof props.onMouseEnter === 'function') {
          props.onMouseEnter(e)
        }
      }}
      onMouseLeave={e => {
        if (!loading && !disabled) {
          const el = e.currentTarget
          const h = hoverBase[variant]
          // Reset to base
          el.style.backgroundColor = (variantStyles[variant].backgroundColor as string) || ''
          el.style.boxShadow = shadow && !loading ? '0 4px 14px rgba(0,0,0,0.08)' : 'none'
        }
        if (typeof props.onMouseLeave === 'function') {
          props.onMouseLeave(e)
        }
      }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'block', animation: 'spin 1s linear infinite' }} />
          Loading…
        </span>
      ) : children}
    </button>
  )
}

'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: string
}

export default function Card({
  children,
  style,
  className,
  onClick,
  hover = false,
  padding = '20px 22px',
}: CardProps) {
  const base: React.CSSProperties = {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    padding,
    boxShadow: 'var(--ts-shadow-card)',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    ...(onClick ? { cursor: 'pointer' } : {}),
    ...style,
  }

  if (!hover) {
    return (
      <div className={className} style={base} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={base}
      onClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'var(--ts-shadow-card-hover)'
        el.style.borderColor = 'var(--color-blue-border, rgba(37,99,235,0.3)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'var(--ts-shadow-card)'
        el.style.borderColor = 'var(--color-border)'
      }}
    >
      {children}
    </div>
  )
}

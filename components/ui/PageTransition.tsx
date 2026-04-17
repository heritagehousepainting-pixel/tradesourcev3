'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fade in on route change
  return (
    <div
      key={pathname}
      style={{
        animation: mounted ? 'pageFadeIn 0.2s ease-out' : 'none',
      }}
    >
      {children}
    </div>
  )
}

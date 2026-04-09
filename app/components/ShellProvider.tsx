'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NO_SHELL_PATHS = ['/founder-login']

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isNoShell = NO_SHELL_PATHS.some(p => pathname.startsWith(p))

  useEffect(() => {
    document.body.classList.toggle('no-shell', isNoShell)
    if (isNoShell) {
      document.body.style.backgroundColor = '#0F172A'
      document.body.style.margin = '0'
    }
  }, [isNoShell])

  return <>{children}</>
}

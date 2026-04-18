'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NO_SHELL_PATHS = ['/signin', '/founder-login']

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isNoShell = NO_SHELL_PATHS.some(p => pathname.startsWith(p))

  useEffect(() => {
    document.body.classList.toggle('no-shell', isNoShell)
    if (isNoShell) {
      // Let the theme token drive the background so sign-in respects light/dark mode.
      document.body.style.backgroundColor = ''
      document.body.style.margin = '0'
    } else {
      document.body.style.margin = ''
    }
  }, [isNoShell])

  return <>{children}</>
}

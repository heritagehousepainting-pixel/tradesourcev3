'use client'

/**
 * Client-side user access hook.
 *
 * Import this in Client Components to get the canonical UserAccess object.
 * Handles the full auth flow: Supabase session → profile fetch → capability resolution.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  type UserAccess,
  type ContractorProfile,
  resolveUserAccess,
  DEFAULT_USER_ACCESS,
} from './access.types'

/**
 * Client-side hook for accessing user auth state and permissions.
 *
 * Usage:
 *   const access = useUserAccess()
 *
 *   if (!access.checked) return <Loading />
 *   // access.isAuthenticated, access.canPostJobs, etc.
 *
 * `access.checked` is `false` during the initial async auth check.
 * Use this to render loading states before redirecting.
 */
export function useUserAccess(): UserAccess {
  const [access, setAccess] = useState<UserAccess>(DEFAULT_USER_ACCESS)

  const fetchAccess = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      setAccess({ ...DEFAULT_USER_ACCESS, checked: true })
      return
    }

    const authUser = session.user

    // Look up contractor profile via the users API endpoint
    // (avoids exposing admin key on the client)
    let profile: ContractorProfile | null = null
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const users: ContractorProfile[] = await res.json()
        const found = users.find(
          (u) =>
            u.id === authUser.id ||
            u.email?.toLowerCase() === authUser.email?.toLowerCase()
        )
        if (found) profile = found
      }
    } catch {
      // Network/API error — continue without profile
    }

    const resolved = resolveUserAccess(authUser, profile)
    setAccess(resolved)
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchAccess()

    // Subscribe to Supabase auth state changes (login, logout, token refresh)
    const supabase = getSupabaseBrowserClient()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAccess({ ...DEFAULT_USER_ACCESS, checked: true })
      } else {
        // Re-check profile on auth change (session may have new user metadata)
        fetchAccess()
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [fetchAccess])

  return access
}

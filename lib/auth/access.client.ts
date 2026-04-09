'use client'

/**
 * Client-side user access hook.
 *
 * Import this in Client Components to get the canonical UserAccess object.
 * Handles the full auth flow: session cookie → profile → capability resolution.
 */

import { useState, useEffect, useCallback } from 'react'
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
 *   if (!access.checked) return <Loading />
 *   // access.canPostJobs, access.canViewApplicationPortal, etc.
 *
 * Profile lookup: reads directly from contractor_applications via Supabase browser client
 * (bypasses API routes — avoids Edge Runtime network issues in Vercel).
 * Uses email matching to find the contractor row, which is fast and reliable.
 */
export function useUserAccess(): UserAccess {
  const [access, setAccess] = useState<UserAccess>(DEFAULT_USER_ACCESS)

  const fetchAccess = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()

    // getSession() reads from the cookie store — no network call, always fast in browser.
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      setAccess({ ...DEFAULT_USER_ACCESS, checked: true })
      return
    }

    // Decode JWT to check founder role (fast, no network).
    let isJwtAdmin = false
    try {
      const token = session.access_token
      if (token) {
        const payload = token.split('.')[1]
        if (payload) {
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
          const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
          const decoded = JSON.parse(atob(padded))
          isJwtAdmin = decoded.app_metadata?.role === 'admin'
        }
      }
    } catch { /* non-founder */ }

    // Try to fetch contractor profile directly from DB via Supabase browser client.
    // This avoids the API route (which goes through Edge Runtime getUser() call).
    // The browser client uses cookie-based auth and reads from RLS.
    let profile: ContractorProfile | null = null
    try {
      // Match by auth UID first, fall back to email.
      const { data: byId } = await supabase
        .from('contractor_applications')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle()
      if (byId) {
        profile = byId
      } else {
        // Fall back to email match
        const { data: byEmail } = await supabase
          .from('contractor_applications')
          .select('*')
          .ilike('email', session.user.email || '')
          .maybeSingle()
        if (byEmail) profile = byEmail
      }
    } catch {
      // Network/RLS error — profile stays null; user gets limited access.
      // At minimum, founder check via JWT works even without profile.
    }

    // Also check NEXT_PUBLIC_FOUNDER_EMAILS for founder detection fallback.
    const { getFounderEmailFromEnv } = await import('./access.types')
    const isFounderEmail = getFounderEmailFromEnv(session.user.email)
    const isFounder = isJwtAdmin || isFounderEmail

    const resolved = resolveUserAccess(session.user, profile)
    // Override isFounderEmail if JWT confirms admin role.
    if (isFounder && !resolved.isFounderEmail) {
      resolved.isFounderEmail = true
    }
    setAccess(resolved)
  }, [])

  useEffect(() => {
    fetchAccess()

    const supabase = getSupabaseBrowserClient()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAccess({ ...DEFAULT_USER_ACCESS, checked: true })
      } else {
        fetchAccess()
      }
    })

    return () => { data.subscription.unsubscribe() }
  }, [fetchAccess])

  return access
}

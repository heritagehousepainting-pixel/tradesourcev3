'use client'

/**
 * Client-side auth/session helpers
 *
 * These utilities wrap the browser Supabase client and provide
 * typed auth operations for Client Components.
 *
 * For reading the current session in pages/components,
 * import `supabase` from '@/lib/supabase' directly and use
 * `supabase.auth.getSession()` or `supabase.auth.onAuthStateChange()`.
 *
 * The NavContext in app/components already handles
 * session listening — prefer extending those rather than
 * replacing them at this stage.
 */

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Sign in with email + password using Supabase Auth.
 * Returns { data, error } like all Supabase client methods.
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign out — clears the Supabase session from cookies.
 */
export async function signOut() {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signOut()
}

/**
 * Get the current session on the client side.
 * Returns { data, error } like all Supabase client methods.
 *
 * Usage:
 *   const { data: { session } } = await getSession()
 *   const user = session?.user
 */
export async function getSession() {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.getSession()
}

/**
 * Subscribe to auth state changes (login, logout, token refresh).
 * Returns an unsubscribe function.
 *
 * Usage:
 *   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 *     console.log('Auth event:', event, session?.user?.email)
 *   })
 *   // Later: subscription.unsubscribe()
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.onAuthStateChange(callback)
}

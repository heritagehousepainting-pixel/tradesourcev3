/**
 * Browser/Client Supabase client
 *
 * Uses @supabase/ssr for cookie-based session management.
 * This client automatically handles refreshing the auth session
 * on the client side and syncs with the server-side cookie store.
 *
 * Use this in: React Client Components, 'use client' pages.
 * Do NOT use this in: Server Components, API Routes (use server.ts instead).
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton browser client — safe to import directly in Client Components.
 * Automatically reads/writes auth cookies in the browser.
 */
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient
  browserClient = createClient()
  return browserClient
}

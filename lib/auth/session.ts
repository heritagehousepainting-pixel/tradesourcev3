/**
 * Server-side auth/session helpers
 *
 * @server-only — only import from API routes, Server Components, and Server Actions.
 * Never import from 'use client' files.
 */

import { getSupabaseServerClient, getSupabaseServerClientFromCookies } from '@/lib/supabase/server-only'

export interface ServerSessionUser {
  id: string
  email: string
  /** Raw session from Supabase */
  session: any
  /** Auth metadata from the user record */
  metadata: Record<string, any>
}

/**
 * Get the current authenticated user from a NextRequest (API Route Handler).
 *
 * Returns null if the user is not authenticated.
 *
 * Usage:
 *   import { getServerSession } from '@/lib/auth/session'
 *   export async function GET(request: NextRequest) {
 *     const user = await getServerSession(request)
 *     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *     // ... proceed with authenticated logic
 *   }
 */
export async function getServerSession(request: Request) {
  const { supabase } = await getSupabaseServerClient(request as any)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? '',
    session: user,
    metadata: user.user_metadata ?? {},
  } satisfies ServerSessionUser
}

/**
 * Get the current authenticated user in a Server Component or Server Action
 * using Next.js `cookies()`.
 *
 * Usage (Server Component):
 *   import { getServerSessionFromCookies } from '@/lib/auth/session'
 *   import { cookies } from 'next/headers'
 *   export default async function Page() {
 *     const user = await getServerSessionFromCookies()
 *     // ...
 *   }
 */
export async function getServerSessionFromCookies() {
  const supabase = await getSupabaseServerClientFromCookies()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? '',
    session: user,
    metadata: user.user_metadata ?? {},
  } satisfies ServerSessionUser
}

/**
 * Require a session — throws if not authenticated.
 * Useful in API routes that must be protected.
 *
 * Usage:
 *   const user = await requireServerSession(request)
 *   // user is guaranteed non-null here
 */
export async function requireServerSession(request: Request) {
  const user = await getServerSession(request)
  if (!user) {
    throw new Error('Unauthorized: No active session')
  }
  return user
}

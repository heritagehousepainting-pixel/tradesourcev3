/**
 * Server-side user access helpers.
 *
 * 'use server' ensures these are never bundled into the client.
 * Import from API routes, Server Components, and Server Actions only.
 */

import type { NextRequest } from 'next/server'
import {
  type UserAccess,
  type ContractorProfile,
  resolveUserAccess,
  DEFAULT_USER_ACCESS,
} from './access.types'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

/**
 * Fetch a contractor profile by ID, falling back to email match.
 * Uses the admin client so it bypasses RLS policies.
 * Returns null if no matching row is found.
 */
async function fetchContractorProfile(
  userId: string,
  userEmail?: string
): Promise<ContractorProfile | null> {
  try {
    const supabase = await getSupabaseAdminClient()

    // Try by ID first (fastest, most reliable)
    const { data: byId } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (byId) return byId as ContractorProfile

    // Fall back to email match
    if (userEmail) {
      const { data: byEmail } = await supabase
        .from('contractor_applications')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle()

      if (byEmail) return byEmail as ContractorProfile
    }

    return null
  } catch {
    // If the admin query fails, return null — auth user still exists
    return null
  }
}

/**
 * Get the current user's access object in a Next.js API route.
 *
 * Usage:
 *   import { getServerUserAccess } from '@/lib/auth/access.server'
 *
 *   export async function GET(request: NextRequest) {
 *     const access = await getServerUserAccess(request)
 *     if (!access.isAuthenticated) {
 *       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *     }
 *     // access.isFounderEmail, access.canPostJobs, etc. are all available
 *   }
 */
export async function getServerUserAccess(
  request: NextRequest
): Promise<UserAccess> {
  // ── Fast path: read user info from headers set by the middleware ────────────────
  // The middleware decodes the JWT from cookies and attaches user info as headers.
  // This avoids a getUser() network call which can fail in Edge Runtime.
  const headerUserId = request.headers.get('x-supabase-user-id') || null
  const headerEmail = request.headers.get('x-supabase-user-email') || null
  const headerIsFounder = request.headers.get('x-supabase-is-founder') === '1'

  if (headerUserId) {
    // User is authenticated (middleware verified the JWT).
    // Build a minimal user object for resolveUserAccess.
    const minimalUser = {
      id: headerUserId,
      email: headerEmail || undefined,
      app_metadata: headerIsFounder ? { role: 'admin' } : {},
    }
    const profile = await fetchContractorProfile(headerUserId, headerEmail || undefined)
    return resolveUserAccess(minimalUser as any, profile)
  }

  // ── Fallback: try getUser() for non-middleware contexts (e.g., Server Components) ─
  const { supabase } = await getSupabaseServerClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ...DEFAULT_USER_ACCESS, checked: true }
  }

  const profile = await fetchContractorProfile(user.id, user.email)
  return resolveUserAccess(user, profile)
}

/**
 * Get the current user's access object in a Server Component or Server Action.
 * Uses Next.js `cookies()` internally.
 *
 * Usage:
 *   import { getServerUserAccessFromCookies } from '@/lib/auth/access.server'
 *   import { cookies } from 'next/headers'
 *
 *   export default async function Page() {
 *     const access = await getServerUserAccessFromCookies()
 *     // ...
 *   }
 */
export async function getServerUserAccessFromCookies(): Promise<UserAccess> {
  const { getSupabaseServerClientFromCookies } = await import(
    '@/lib/supabase/server'
  )
  const supabase = await getSupabaseServerClientFromCookies()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ...DEFAULT_USER_ACCESS, checked: true }
  }

  const profile = await fetchContractorProfile(user.id, user.email)
  return resolveUserAccess(user, profile)
}

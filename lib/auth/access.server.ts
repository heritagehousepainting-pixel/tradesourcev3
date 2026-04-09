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

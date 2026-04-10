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
 * Decode a Supabase JWT and return the payload.
 * No cryptographic verification — use only in trusted server-side contexts.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Supabase JWTs use base64url encoding
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString())
  } catch {
    return null
  }
}

/**
 * Fetch a contractor profile by ID, falling back to email match.
 * Uses the admin client so it bypasses RLS policies.
 *
 * Tries three strategies in order:
 *   1. Match by contractor_applications.id (founders, or legacy)
 *   2. Match by contractor_applications.auth_user_id (contractors — their auth UID
 *      differs from their contractor_application.id)
 *   3. Match by email (last resort)
 */
async function fetchContractorProfile(
  userId: string,
  userEmail?: string
): Promise<ContractorProfile | null> {
  try {
    const supabase = await getSupabaseAdminClient()

    // Strategy 1: match by contractor_application.id
    const { data: byId } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (byId) return byId as ContractorProfile

    // Strategy 2: match by auth_user_id (contractors)
    const { data: byAuthId } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()
    if (byAuthId) return byAuthId as ContractorProfile

    // Strategy 3: fall back to email match
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
    return null
  }
}

/**
 * Get the current user's access object in a Next.js API route.
 *
 * Supports two auth methods:
 *   1. Authorization: Bearer <jwt> header (for service-role clients, scripts, tests)
 *   2. Cookie-based auth (browser sessions — middleware sets x-supabase-* headers)
 *
 * Priority: Bearer token > Cookie/middleware headers > getUser() fallback
 */
export async function getServerUserAccess(
  request: NextRequest
): Promise<UserAccess> {
  // ── Fast path: Authorization Bearer token (service-role / scripts / tests) ─────
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = decodeJwtPayload(token)
    if (payload?.sub) {
      const userId = payload.sub as string
      const email = (payload.email as string) || null
      const isJwtAdmin = (payload.app_metadata as Record<string, unknown>)?.role === 'admin'
      const minimalUser = {
        id: userId,
        email,
        app_metadata: isJwtAdmin ? { role: 'admin' } : {},
      }
      const profile = await fetchContractorProfile(userId, email || undefined)
      return resolveUserAccess(minimalUser as any, profile)
    }
  }

  // ── Middleware headers (browser cookie session) ─────────────────────────────────
  const headerUserId = request.headers.get('x-supabase-user-id') || null
  const headerEmail = request.headers.get('x-supabase-user-email') || null
  const headerIsFounder = request.headers.get('x-supabase-is-founder') === '1'

  if (headerUserId) {
    const minimalUser = {
      id: headerUserId,
      email: headerEmail || undefined,
      app_metadata: headerIsFounder ? { role: 'admin' } : {},
    }
    const profile = await fetchContractorProfile(headerUserId, headerEmail || undefined)
    return resolveUserAccess(minimalUser as any, profile)
  }

  // ── Fallback: getUser() via cookie (non-middleware contexts) ─────────────────
  const { supabase } = await getSupabaseServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ...DEFAULT_USER_ACCESS, checked: true }

  const profile = await fetchContractorProfile(user.id, user.email)
  return resolveUserAccess(user, profile)
}

/**
 * Get the current user's access object in a Server Component or Server Action.
 * Uses Next.js cookies() internally.
 */
export async function getServerUserAccessFromCookies(): Promise<UserAccess> {
  const { getSupabaseServerClientFromCookies } = await import('@/lib/supabase/server')
  const supabase = await getSupabaseServerClientFromCookies()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ...DEFAULT_USER_ACCESS, checked: true }

  const profile = await fetchContractorProfile(user.id, user.email)
  return resolveUserAccess(user, profile)
}

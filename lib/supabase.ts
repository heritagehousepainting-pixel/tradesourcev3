/**
 * Supabase client — central export point
 *
 * `supabase` — the browser/client Supabase client instance.
 *   Use in: React Client Components, 'use client' pages.
 *   Existing imports like `import { supabase } from '@/lib/supabase'` continue to work.
 *
 * Server utilities:
 *   import { getSupabaseServerClient } from '@/lib/supabase/server'
 *   import { getSupabaseAdminClient } from '@/lib/supabase/server'
 *
 * Auth helpers:
 *   import { getServerSession } from '@/lib/auth/session'
 *   import { signIn, signOut } from '@/lib/auth/client'
 *
 * Canonical access model:
 *   import { useUserAccess, type UserAccess } from '@/lib/auth/access'
 *   import { getServerUserAccess } from '@/lib/auth/access.server'   // server only
 *
 * The legacy getSupabaseAdmin() is also re-exported for backward compat.
 */

import { createBrowserClient } from '@supabase/ssr'

// ─── Browser/client instance ───────────────────────────────────────────────────
// Safe to use in Client Components. Automatically handles cookie-based sessions.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Server utilities ─────────────────────────────────────────────────────────

export {
  getSupabaseServerClient,
  getSupabaseServerClientFromCookies,
  getSupabaseAdminClient,
} from '@/lib/supabase/server'

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export {
  getServerSession,
  getServerSessionFromCookies,
  requireServerSession,
  type ServerSessionUser,
} from '@/lib/auth/session'

export { signIn, signOut, getSession, onAuthStateChange } from '@/lib/auth/client'

// ─── Access model ─────────────────────────────────────────────────────────────
// Types (safe everywhere)
export type { UserAccess, UserRole, VettingStatus, AccountStatus } from '@/lib/auth/access.types'
export type { ContractorProfile } from '@/lib/auth/access.types'
export {
  DEFAULT_USER_ACCESS,
  resolveUserAccess,
  isFounderEmail,
} from '@/lib/auth/access.types'
// Server-only helpers
export {
  getServerUserAccess,
  getServerUserAccessFromCookies,
} from '@/lib/auth/access.server'
// Client-only hook
export { useUserAccess } from '@/lib/auth/access.client'

// ─── Legacy admin client ───────────────────────────────────────────────────────
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient | null = null

/**
 * @deprecated Use `getSupabaseAdminClient()` from '@/lib/supabase/server' instead.
 * Kept only for backward compatibility with existing code.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to .env.local.'
    )
  }
  _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
  return _supabaseAdmin
}

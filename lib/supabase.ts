/**
 * Client-safe Supabase and auth exports.
 *
 * Use this file in Client Components ('use client') and browser code only.
 * Never import server-only utilities from this file.
 *
 * For server-side code, import directly from:
 *   import { getSupabaseServerClient } from '@/lib/supabase/server'
 *   import { getSupabaseAdminClient } from '@/lib/supabase/server'
 *   import { getServerUserAccess } from '@/lib/auth/access.server'
 *   import { getServerSession } from '@/lib/auth/session'
 */

import { createBrowserClient } from '@supabase/ssr'

// ─── Browser/client instance ───────────────────────────────────────────────────
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Auth helpers ──────────────────────────────────────────────────────────────
export { signIn, signOut, getSession, onAuthStateChange } from '@/lib/auth/client'

// ─── Access model ─────────────────────────────────────────────────────────────
export type {
  UserAccess,
  UserRole,
  VettingStatus,
  AccountStatus,
  ContractorProfile,
} from '@/lib/auth/access.types'

export {
  DEFAULT_USER_ACCESS,
  resolveUserAccess,
  isFounderEmail,
} from '@/lib/auth/access.types'

export { useUserAccess } from '@/lib/auth/access.client'

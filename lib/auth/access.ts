/**
 * Canonical user access model — central barrel re-export.
 *
 * Import the types and helpers you need directly from the appropriate sub-module:
 *
 *   // Types (safe everywhere — client & server)
 *   import { type UserAccess, type ContractorProfile, type UserRole } from '@/lib/auth/access.types'
 *
 *   // Pure resolution logic (safe everywhere)
 *   import { resolveUserAccess, isFounderEmail } from '@/lib/auth/access.types'
 *
 *   // Client hook (Client Components only)
 *   import { useUserAccess } from '@/lib/auth/access.client'
 *
 *   // Server helpers (API routes, Server Components only)
 *   import { getServerUserAccess } from '@/lib/auth/access.server'
 *
 * Or import everything from this barrel (it re-exports from all three):
 *   import { useUserAccess, type UserAccess, resolveUserAccess } from '@/lib/auth/access'
 */

// ─── Types (from access.types — safe everywhere) ───────────────────────────────

export type { UserAccess, UserRole, VettingStatus, AccountStatus } from './access.types'
export type { ContractorProfile } from './access.types'
export { DEFAULT_USER_ACCESS, resolveUserAccess, isFounderEmail } from './access.types'

// ─── Server helpers (from access.server — server-only) ───────────────────────

export { getServerUserAccess, getServerUserAccessFromCookies } from './access.server'

// ─── Client helpers (from access.client — client-only) ──────────────────────

export { useUserAccess } from './access.client'

/**
 * Server-only Supabase exports.
 *
 * Only import this file from server-side code:
 *   - API route handlers
 *   - Server Actions
 *   - Server Components
 *   - Other server-side utility files (e.g., lib/auth/session.ts)
 *
 * NEVER import this from 'use client' files.
 */

export { getSupabaseServerClient } from './server'
export { getSupabaseServerClientFromCookies } from './server'
export { getSupabaseAdminClient } from './server'

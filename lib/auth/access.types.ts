/**
 * Shared types and pure functions for the canonical user access model.
 *
 * This file has NO 'use client' / 'use server' directive — it contains only:
 *   - TypeScript interfaces and types
 *   - Pure functions with no server-only dependencies
 *
 * Safe to import from both client and server code.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'guest' | 'authenticated' | 'contractor' | 'founder'
export type VettingStatus = 'pending' | 'approved' | 'rejected' | null
export type AccountStatus =
  | 'pending_review'
  | 'pending'
  | 'approved'
  | 'rejected'
  | null

/** Raw profile row from contractor_applications */
export interface ContractorProfile {
  id: string
  email: string
  name?: string
  full_name?: string
  company?: string
  phone?: string
  status: 'pending_review' | 'pending' | 'approved' | 'rejected'
  verified_insurance: boolean
  verified_license: boolean
  verified_w9: boolean
  verified_external: boolean
  is_pro: boolean
  created_at: string
  updated_at: string
}

/**
 * The canonical normalized access object.
 * Use this everywhere instead of ad-hoc auth checks.
 */
export interface UserAccess {
  /** True once the first auth check completes (never reverts to false) */
  checked: boolean

  // ─── Identity ───────────────────────────────────────────────────────────────

  isAuthenticated: boolean
  userId: string | null
  email: string | null
  /** Prefers profile.name / profile.full_name / profile.company, falls back to email */
  displayName: string | null

  // ─── Role & Status ─────────────────────────────────────────────────────────

  role: UserRole
  vettingStatus: VettingStatus
  accountStatus: AccountStatus

  /** Whether the user has a row in contractor_applications */
  hasProfile: boolean

  // ─── Capability flags ──────────────────────────────────────────────────────

  /** Can access the contractor dashboard (includes vetting-pending users) */
  canAccessContractorApp: boolean

  /** Can post jobs — requires approved status (or founder) */
  canPostJobs: boolean

  /** Can send/receive messages — requires approved status (or founder) */
  canMessage: boolean

  /** Can view /admin — founder only */
  canViewApplicationPortal: boolean

  /** Can use the AI assistant widget — founder only at MVP */
  canUseAssistant: boolean

  // ─── Raw data ───────────────────────────────────────────────────────────────

  /** The raw contractor_applications row (null if no profile) */
  profile: ContractorProfile | null

  /** True if the user's email is in NEXT_PUBLIC_FOUNDER_EMAILS */
  isFounderEmail: boolean
}

// ─── Default (signed-out) access ─────────────────────────────────────────────

export const DEFAULT_USER_ACCESS: UserAccess = {
  checked: false,
  isAuthenticated: false,
  userId: null,
  email: null,
  displayName: null,
  role: 'guest',
  vettingStatus: null,
  accountStatus: null,
  hasProfile: false,
  canAccessContractorApp: false,
  canPostJobs: false,
  canMessage: false,
  canViewApplicationPortal: false,
  canUseAssistant: false,
  profile: null,
  isFounderEmail: false,
}

// ─── Founder email resolution ─────────────────────────────────────────────────

/**
 * Parse NEXT_PUBLIC_FOUNDER_EMAILS into a Set of lowercase emails.
 * Returns an empty set if the env var is empty or missing.
 */
function getFounderEmails(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_FOUNDER_EMAILS
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * Check if an email is a founder email.
 * Works in both client and server contexts — no network calls.
 */
export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getFounderEmails().has(email.toLowerCase())
}

// ─── Access resolution ────────────────────────────────────────────────────────

/**
 * Resolve a raw auth user + profile into a full UserAccess object.
 *
 * Pure function — no network calls, no side effects.
 * Used by both server-side and client-side helpers.
 *
 * @param authUser  — Supabase auth user object (null if signed out)
 * @param profile   — contractor_applications row (null if not found)
 */
export function resolveUserAccess(
  authUser: { id: string; email?: string } | null,
  profile: ContractorProfile | null
): UserAccess {
  const email = authUser?.email ?? null
  const userId = authUser?.id ?? null
  const isFounder = isFounderEmail(email)

  // ── Guest (not signed in) ──────────────────────────────────────────────────
  if (!authUser) {
    return { ...DEFAULT_USER_ACCESS, checked: true }
  }

  // ── No profile row — authenticated but no contractor account ───────────────
  if (!profile) {
    return {
      checked: true,
      isAuthenticated: true,
      userId,
      email,
      displayName: email,
      role: 'authenticated',
      vettingStatus: null,
      accountStatus: null,
      hasProfile: false,
      canAccessContractorApp: false,
      canPostJobs: false,
      canMessage: false,
      canViewApplicationPortal: isFounder,
      canUseAssistant: isFounder,
      profile: null,
      isFounderEmail: isFounder,
    }
  }

  // ── Has profile — determine vetting and role ───────────────────────────────

  const isApproved = profile.status === 'approved'
  const isRejected = profile.status === 'rejected'
  const isPending =
    profile.status === 'pending_review' || profile.status === 'pending'

  // Founder/admin: all contractor capabilities + admin-only ones
  if (isFounder) {
    return {
      checked: true,
      isAuthenticated: true,
      userId,
      email,
      displayName:
        profile.full_name || profile.name || profile.company || email,
      role: 'founder',
      vettingStatus: 'approved', // founders always treated as approved
      accountStatus: profile.status,
      hasProfile: true,
      canAccessContractorApp: true,
      canPostJobs: true,
      canMessage: true,
      canViewApplicationPortal: true,
      canUseAssistant: true,
      profile,
      isFounderEmail: true,
    }
  }

  // Rejected — locked out of all contractor access
  if (isRejected) {
    return {
      checked: true,
      isAuthenticated: true,
      userId,
      email,
      displayName:
        profile.full_name || profile.name || profile.company || email,
      role: 'contractor',
      vettingStatus: 'rejected',
      accountStatus: 'rejected',
      hasProfile: true,
      canAccessContractorApp: false,
      canPostJobs: false,
      canMessage: false,
      canViewApplicationPortal: false,
      canUseAssistant: false,
      profile,
      isFounderEmail: false,
    }
  }

  // Pending (unvetted but applied) — limited dashboard access
  if (isPending) {
    return {
      checked: true,
      isAuthenticated: true,
      userId,
      email,
      displayName:
        profile.full_name || profile.name || profile.company || email,
      role: 'contractor',
      vettingStatus: 'pending',
      accountStatus: profile.status,
      hasProfile: true,
      canAccessContractorApp: true, // can view dashboard but no posting/messaging
      canPostJobs: false,
      canMessage: false,
      canViewApplicationPortal: false,
      canUseAssistant: false,
      profile,
      isFounderEmail: false,
    }
  }

  // Approved (vetted contractor) — full contractor access
  return {
    checked: true,
    isAuthenticated: true,
    userId,
    email,
    displayName:
      profile.full_name || profile.name || profile.company || email,
    role: 'contractor',
    vettingStatus: 'approved',
    accountStatus: 'approved',
    hasProfile: true,
    canAccessContractorApp: true,
    canPostJobs: true,
    canMessage: true,
    canViewApplicationPortal: false,
    canUseAssistant: false,
    profile,
    isFounderEmail: false,
  }
}

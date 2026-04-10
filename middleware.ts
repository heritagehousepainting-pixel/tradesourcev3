/**
 * TradeSource route middleware.
 *
 * Enforces server-side auth before protected page shells render.
 * Uses Supabase cookie-based session (same as all other auth helpers).
 *
 * Protected routes:
 *   /admin                        → founder/admin only
 *   /dashboard                    → any authenticated user
 *   /profile                      → any authenticated user
 *   /my-jobs                      → any authenticated user
 *   /post-job                     → any authenticated user (canPostJobs checked on page)
 *
 * Public routes (excluded from all checks):
 *   /, /apply, /founder-login, /login
 *   /jobs, /jobs/[id]
 *   /pending
 *   /api/*, /_next/*, /favicon.ico, /images/*
 *
 * Design notes:
 *   - Runs BEFORE the page renders, closing the gap that page-level hooks can't.
 *   - Page-level guards remain as defense-in-depth (e.g., !access.canPostJobs).
 *   - Middleware can't fetch the contractor profile row cheaply, so admin
 *     permission is resolved by email check (no DB call) — the same pattern
 *     used in resolveUserAccess() for isFounderEmail.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

// ─── Config ───────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Skip static files, API routes, and Next internals
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}

// ─── Protected route definitions ──────────────────────────────────────────────

/**
 * Routes that require any authenticated session.
 * Signed-out users are redirected to /founder-login.
 * (Page-level checks then enforce further capability requirements.)
 */
const AUTHED_ROUTES = ['/dashboard', '/profile', '/my-jobs', '/post-job'] as const

/**
 * Routes that require founder/admin status.
 * Redirects to / if signed-out; redirects to /founder-login if not a founder.
 */
const ADMIN_ROUTES = ['/admin'] as const

// ─── Founder email check ───────────────────────────────────────────────────────

function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const raw = process.env.NEXT_PUBLIC_FOUNDER_EMAILS
  if (!raw) return false
  const set = new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
  return set.has(email.toLowerCase())
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Build a Supabase server client to read the auth cookie ─────────────────
  //
  // createServerClient from @supabase/ssr works in Edge Runtime (middleware).
  // We build it inline here rather than using getSupabaseServerClient()
  // because middleware is the outermost layer and can't depend on the helper
  // (which expects to be called from inside a Next.js server context).

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Read the current user from the Supabase session cookie.
  //
  // Approach: decode the JWT from the access_token cookie directly (no network call).
  // This avoids Edge Runtime network restrictions that can cause getUser() to fail.
  // The JWT payload contains: sub (user ID), email, and app_metadata.
  //
  // Supabase access tokens are stored by @supabase/ssr in the
  // sb-{anon_key_short_hash}-auth-token cookie as a JSON string:
  // { accessToken, refreshToken, ... }

  let userId: string | null = null
  let userEmail: string | null = null
  let isJwtAdmin = false

  try {
    const cookies = request.cookies.getAll()
    const authCookie = cookies.find(c =>
      c.name.includes('auth-token') || c.name.startsWith('sb-')
    )
    if (authCookie?.value) {
      // @supabase/ssr v0.10+ stores session as base64-{base64string}
      // The inner session is a JSON string that itself contains the JWT access token.
      let sessionJson = authCookie.value
      if (sessionJson.startsWith('base64-')) {
        const inner = atob(sessionJson.slice(7))
        sessionJson = inner
      }
      const parsed = JSON.parse(sessionJson)
      // accessToken key format: camelCase in v0.10+
      const token = parsed?.accessToken || parsed?.access_token
      if (token) {
        const parts = token.split('.')
        if (parts[1]) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
          const decoded = JSON.parse(atob(padded))
          userId = decoded.sub ?? null
          userEmail = decoded.email ?? null
          isJwtAdmin = (decoded.app_metadata as Record<string, unknown>)?.role === 'admin'
        }
      }
    }
  } catch {
    // Cookie parse/decode failed — treat as unauthenticated
  }

  const isFounder = isJwtAdmin || isFounderEmail(userEmail)
  const isAuthed = !!userId

  // Attach authenticated user info as request headers so the API route can read it
  // without needing to call getUser() (which may fail in Edge Runtime).
  const authHeaders = new Headers(request.headers)
  authHeaders.set('x-supabase-user-id', userId || '')
  authHeaders.set('x-supabase-user-email', userEmail || '')
  authHeaders.set('x-supabase-is-founder', isFounder ? '1' : '0')

  // ── /admin guard ──────────────────────────────────────────────────────────
  //
  // Requires founder/admin status (email in NEXT_PUBLIC_FOUNDER_EMAILS).
  // Redirect to / if signed-out (safe fallback page); redirect to /founder-login
  // with a message if signed-in but not a founder.

  if (ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    if (!isAuthed) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (!isFounder) {
      const url = new URL('/founder-login', request.url)
      url.searchParams.set('reason', 'admin_required')
      return NextResponse.redirect(url)
    }
    supabaseResponse.headers.set('x-supabase-user-id', userId || '')
    supabaseResponse.headers.set('x-supabase-user-email', userEmail || '')
    supabaseResponse.headers.set('x-supabase-is-founder', '1')
    return supabaseResponse
  }

  // ── Authenticated shell guard ───────────────────────────────────────────────
  //
  // Routes that require any valid session but don't need admin.
  // Redirect to /founder-login (the sign-in entry point).
  // Note: the page itself then enforces additional capability checks.

  if (AUTHED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    if (!isAuthed) {
      const url = new URL('/founder-login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Block suspended or removed contractors from all authenticated routes.
    // Check the contractor_applications status via the Supabase server client.
    if (userId && !isFounder) {
      try {
        const profileData = await supabase
          .from('contractor_applications')
          .select('status, auth_user_id')
          .eq('auth_user_id', userId)
          .maybeSingle()
        const profileStatus = String(profileData?.status ?? '')
        if (profileStatus === 'suspended') {
          const url = new URL('/founder-login', request.url)
          url.searchParams.set('reason', 'account_suspended')
          return NextResponse.redirect(url)
        }
        if (profileStatus === 'removed' || profileStatus === 'rejected') {
          const url = new URL('/founder-login', request.url)
          url.searchParams.set('reason', 'account_revoked')
          return NextResponse.redirect(url)
        }
      } catch {
        // Profile lookup failed — let the page-level check handle it.
      }
    }

    return supabaseResponse
  }

  // ── Passthrough for all other routes ──────────────────────────────────────
  // Attach auth headers so API routes can read them without calling getUser().
  supabaseResponse.headers.set('x-supabase-user-id', userId || '')
  supabaseResponse.headers.set('x-supabase-user-email', userEmail || '')
  supabaseResponse.headers.set('x-supabase-is-founder', isFounder ? '1' : '0')
  return supabaseResponse
}

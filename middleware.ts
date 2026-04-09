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
  // No network call — just verifies the JWT and extracts the email/user ID.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? null
  const userId = user?.id ?? null
  const isFounder = isFounderEmail(userEmail)
  const isAuthed = !!user

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
    return supabaseResponse
  }

  // ── Passthrough for all other routes ──────────────────────────────────────
  return supabaseResponse
}

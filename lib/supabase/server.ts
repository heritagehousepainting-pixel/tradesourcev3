/**
 * Server-side Supabase client
 *
 * Uses @supabase/ssr for cookie-based session management.
 * This client reads the auth session from cookies sent by the browser client,
 * making it safe to use in:
 *   - Next.js API Route Handlers
 *   - Server Actions
 *   - React Server Components (with cookies())
 *
 * Usage in API routes:
 *   import { getSupabaseServerClient } from '@/lib/supabase/server'
 *   const supabase = await getSupabaseServerClient(request)
 *
 * Usage in Server Components / Server Actions:
 *   import { getSupabaseServerClient } from '@/lib/supabase/server'
 *   import { cookies } from 'next/headers'
 *   const supabase = await getSupabaseServerClient(cookies())
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Get a Supabase server client from a NextRequest (API routes).
 * Passes request/response cookies so auth state is preserved.
 *
 * Usage:
 *   const { supabase, response } = await getSupabaseServerClient(request)
 *   // ... use supabase for authenticated queries ...
 *   return response  // return the response to propagate cookie changes
 */
export async function getSupabaseServerClient(request: NextRequest) {
  // Create the response first — we'll attach cookie changes to it
  let response = NextResponse.next({
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
            // Set on the request so the supabase client can read them back
            request.cookies.set(name, value)
            // Set on the response so the cookie is sent back to the browser
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  return { supabase, response }
}

/**
 * Get a Supabase server client from Next.js 14+ `cookies()` (Server Components / Server Actions).
 * This is the preferred way in App Router Server Components.
 */
export async function getSupabaseServerClientFromCookies() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies() can only be called in a Server Context
          }
        },
      },
    }
  )

  return supabase
}

/**
 * Admin server client — bypasses RLS policies.
 * Use ONLY in secure server contexts (API routes, Server Actions) where
 * you need to perform admin-level operations.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (never expose to client).
 */
export async function getSupabaseAdminClient() {
  const { createClient } = await import('@supabase/supabase-js')

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

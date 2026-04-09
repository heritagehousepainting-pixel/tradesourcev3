import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/users — fetch contractor applications.
// Accessible by any authenticated user (used by useUserAccess() for profile lookup).
// Returns all rows only because the caller must be authenticated — the client
// is expected to filter to the matching user_id or email for their own profile.
// For admin/admin-portal use, POST /api/users/[id] with canViewApplicationPortal
// provides per-record access.
export async function GET(request: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('contractor_applications')
      .select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Strip sensitive fields (email, phone) for non-admin users.
    // Admins see everything; regular authenticated users only see public-safe fields.
    const isAdmin = (access as any).canViewApplicationPortal === true || (access as any).isFounderEmail === true
    const safeFields = [
      'id', 'name', 'full_name', 'company', 'license_number', 'license_state',
      'years_in_trade', 'trade_specialization', 'insurance_expiry',
      'status', 'verified_w9', 'verified_insurance', 'verified_license',
      'verified_external', 'is_pro', 'bio', 'created_at',
      'w9_url', 'insurance_url', 'external_reviews',
      'notes', 'reviewed_at',
    ]
    const sanitized = isAdmin
      ? data
      : (data || []).map(row => {
          const safe: Record<string, unknown> = {}
          for (const key of safeFields) {
            if (key in row) safe[key] = (row as Record<string, unknown>)[key]
          }
          return safe
        })

    return NextResponse.json(sanitized)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/users — deprecated.
// This endpoint was used for bulk admin actions before per-record routes existed.
// Now that POST /api/users/[id] (with canViewApplicationPortal) covers admin
// update operations, this endpoint is unused by the frontend and should not be
// called by clients. Kept for backward compat but guarded to admin only.
export async function POST(request: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const body = await request.json()
    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('contractor_applications')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        error: error.message,
        hint: error.hint,
        details: error.details,
        table: 'contractor_applications',
      }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import type { NextRequest } from 'next/server'

// POST /api/jobs/[id]/interest — express interest in a job
// Requires: authenticated user with a contractor profile
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    const body = await request.json()
    const { contractor_id } = body

    // ── Auth check ──────────────────────────────────────────────────────────────
    // Require an authenticated session — uses cookie-based Supabase auth.
    // After founder-login migration, contractor_id comes from the canonical access
    // object instead of the request body.
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    if (!contractor_id) {
      return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 })
    }

    // Verify contractor_id matches the authenticated user (or is a founder/admin bypass)
    if (!access.isFounderEmail && access.userId && access.userId !== contractor_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use getServerUserAccess for the DB client (bypasses RLS via admin key)
    const { getSupabaseAdminClient } = await import('@/lib/supabase/server')
    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('job_interests')
      .insert([{ job_id: jobId, contractor_id }])
      .select()
      .single()

    if (error) {
      // Handle duplicate gracefully (contractor already expressed interest)
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already expressed interest', already_interested: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

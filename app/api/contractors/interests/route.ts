import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/contractors/interests?contractor_id=xxx
// Returns all job interests for the specified contractor.
// Access: the contractor themselves, or founder/admin.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')

    if (!contractorId) {
      return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 })
    }

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Non-founders: contractor_id must match their own profile ID.
    if (!access.isFounderEmail && access.userId && access.userId !== contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    const { data: interests, error } = await supabase
      .from('job_interests')
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          description,
          area,
          budget_min,
          budget_max,
          status,
          contractor_id,
          homeowner_email,
          homeowner_name,
          created_at
        )
      `)
      .eq('contractor_id', contractorId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(interests || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

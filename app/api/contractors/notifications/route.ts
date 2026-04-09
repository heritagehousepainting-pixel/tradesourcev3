import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/contractors/notifications?contractor_id=xxx
// Fetch notification preferences for the specified contractor.
// Access: the contractor themselves, or founder/admin.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')

    if (!contractorId) {
      return NextResponse.json({ error: 'contractor_id required' }, { status: 400 })
    }

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!access.isFounderEmail && access.userId && access.userId !== contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('id, contractor_id, email, trade_scope, enabled')
      .eq('contractor_id', contractorId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/contractors/notifications
// Subscribe or update notification preferences for a contractor.
// Access: the contractor themselves, or founder/admin.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contractor_id, email, trade_scope, location_scope, enabled } = body

    if (!contractor_id || !email) {
      return NextResponse.json({ error: 'contractor_id and email required' }, { status: 400 })
    }

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Non-founders: contractor_id must match their own profile ID.
    if (!access.isFounderEmail && access.userId && access.userId !== contractor_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const supabase = await getSupabaseAdminClient()

    const insertData: Record<string, unknown> = {
      contractor_id,
      email,
      trade_scope: trade_scope || 'painting',
      enabled: enabled !== false,
    }
    if (location_scope) insertData.location_scope = location_scope

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert([insertData], { onConflict: 'contractor_id' })
      .select('id, contractor_id, email, trade_scope, enabled')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

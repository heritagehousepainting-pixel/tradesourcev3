import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// GET /api/admin/activity-log — fetch recent admin actions
export async function GET(request: Request) {
  try {
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.canViewApplicationPortal) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = await getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/admin/activity-log — record an admin action
export async function POST(request: Request) {
  try {
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.canViewApplicationPortal) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { action, contractor_name, contractor_id, details } = await request.json()
    if (!action) return NextResponse.json({ error: 'action required' }, { status: 400 })

    const supabase = await getSupabaseAdminClient()
    const { error } = await supabase.from('admin_activity_log').insert({
      action,
      contractor_name: contractor_name || null,
      contractor_id: contractor_id || null,
      details: details || null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
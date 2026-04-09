import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getServerUserAccess } from '@/lib/auth/access.server'

// GET /api/profile-edit-requests?contractor_id=xxx
// Fetches any pending (pending_review) edit request for a contractor
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')

    if (!contractorId) {
      return NextResponse.json({ error: 'contractor_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profile_edit_requests')
      .select('*')
      .eq('contractor_id', contractorId)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/profile-edit-requests
// Creates or updates a pending edit request (authenticated + owner only)
export async function POST(request: Request) {
  try {
    const { getServerUserAccess } = await import('@/lib/auth/access.server')
    const access = await getServerUserAccess(request as any)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!access.canAccessContractorApp) {
      return NextResponse.json({ error: 'Contractor account required' }, { status: 403 })
    }

    const body = await request.json()
    const { contractor_id, changes } = body

    if (!contractor_id || !changes) {
      return NextResponse.json({ error: 'contractor_id and changes required' }, { status: 400 })
    }

    // Must be editing own profile (unless founder/admin)
    if (access.role !== 'founder' && access.profile?.id !== contractor_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await getSupabaseAdminClient()

    // Check if there's already a pending edit
    const { data: existing } = await supabase
      .from('profile_edit_requests')
      .select('id')
      .eq('contractor_id', contractor_id)
      .eq('status', 'pending_review')
      .limit(1)
      .single()

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('profile_edit_requests')
        .update({ changes, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      result = data
    } else {
      const { data, error } = await supabase
        .from('profile_edit_requests')
        .insert([{ contractor_id, changes, status: 'pending_review' }])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      result = data
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/profile-edit-requests?contractor_id=xxx
// Cancel pending edit request (owner only)
export async function DELETE(request: Request) {
  try {
    const { getServerUserAccess } = await import('@/lib/auth/access.server')
    const access = await getServerUserAccess(request as any)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')

    if (!contractorId) {
      return NextResponse.json({ error: 'contractor_id required' }, { status: 400 })
    }

    // Must be cancelling own edit request (unless founder)
    if (access.role !== 'founder' && access.profile?.id !== contractorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await getSupabaseAdminClient()

    const { error } = await supabase
      .from('profile_edit_requests')
      .update({ status: 'cancelled' })
      .eq('contractor_id', contractorId)
      .eq('status', 'pending_review')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

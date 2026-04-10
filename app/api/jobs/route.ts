import { NextResponse } from 'next/server'
import { getServerUserAccess } from '@/lib/auth/access.server'
import type { NextRequest } from 'next/server'

// GET /api/jobs — public browse (no auth required)
export async function GET(request: Request) {
  try {
    const { getSupabaseAdminClient } = await import('@/lib/supabase/server')
    const supabase = await getSupabaseAdminClient()

    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractor_id')
    const homeownerEmail = searchParams.get('homeowner_email')

    let query = supabase
      .from('jobs')
      .select('*, poster:poster_id(id, name, full_name, company, email, phone, license_number, license_state, verified_license, verified_insurance, verified_w9, verified_external, is_pro, created_at)')
      .order('created_at', { ascending: false })

    if (homeownerEmail) {
      query = query.eq('homeowner_email', homeownerEmail)
    }
    if (contractorId) {
      query = query.eq('contractor_id', contractorId)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/jobs — create a new job posting
// Requires: authenticated contractor (approved) or homeowner
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ── Auth check ──────────────────────────────────────────────────────────────
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // PostJob capability (approved + founder) — homeowners not yet active in MVP
    if (!access.canPostJobs) {
      return NextResponse.json({ error: 'Only approved contractors can post jobs' }, { status: 403 })
    }
    // ── End auth check ────────────────────────────────────────────────────────

    const { getSupabaseAdminClient } = await import('@/lib/supabase/server')
    const supabase = await getSupabaseAdminClient()

    // Determine if this is a verified homeowner post
    let isVerifiedHomeowner = false
    let homeownerEmail = body.homeowner_email || null

    if (body.homeowner_token) {
      // Verify homeowner via session token
      const { data: hw } = await supabase
        .from('homeowners')
        .select('id, email')
        .eq('id', body.homeowner_token)
        .single()

      if (hw) {
        isVerifiedHomeowner = true
        homeownerEmail = hw.email
      }
    }

    const insertBody: any = {
      title: body.title,
      description: body.description,
      area: body.location,
      budget_min: body.budget_min,
      budget_max: body.budget_max,
      property_type: body.property_type,
      scope: body.scope,
      sq_footage: body.sq_footage,
      status: 'open',
      homeowner_email: homeownerEmail || body.homeowner_email || null,
      homeowner_name: body.homeowner_name || null,
      is_verified_homeowner: isVerifiedHomeowner,
      poster_id: body.poster_id || null,
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([insertBody])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // --- Notification Engine ---
    try {
      const scope = body.scope || 'interior'

      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('id, contractor_id, email')
        .eq('enabled', true)
        .or(`trade_scope.eq.${scope},trade_scope.eq.painting,trade_scope.ilike.%${scope}%`)

      if (prefs && prefs.length > 0) {
        const notifications = prefs.map((pref: any) => ({
          contractor_id: pref.contractor_id,
          job_id: job.id,
          notification_preference_id: pref.id,
          email: pref.email,
          job_title: job.title,
          job_location: job.area,
          status: 'pending',
        }))

        await supabase
          .from('notification_queue')
          .insert(notifications)
      }
    } catch (notifErr) {
      // Notification matching is best-effort; don't fail the job post
      console.error('Notification matching failed:', notifErr)
    }

    return NextResponse.json(job)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

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
      .select(`
        *,
        poster:poster_id(id, name, full_name, company, email, phone, license_number, license_state, verified_license, verified_insurance, verified_w9, verified_external, is_pro, created_at),
        job_photos(id, url, filename, file_size, created_at)
      `)
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
      // ── Structured scope fields (from AI Scope Builder) ─────────────
      included_areas: body.included_areas || null,
      surfaces: body.surfaces || null,
      prep_requirements: body.prep_requirements || null,
      repairs_needed: body.repairs_needed || null,
      occupancy: body.occupancy || null,
      furniture: body.furniture || null,
      access_notes: body.access_notes || null,
      materials_notes: body.materials_notes || null,
      finish_expectations: body.finish_expectations || null,
      exclusions: body.exclusions || null,
      special_instructions: body.special_instructions || null,
      door_drawer_count: body.door_drawer_count || null,
      current_finish: body.current_finish || null,
      on_site_off_site: body.on_site_off_site || null,
      condition: body.condition || null,
      reinstall_responsibility: body.reinstall_responsibility || null,
      stories: body.stories || null,
      peeling_priming: body.peeling_priming || null,
      power_washing: body.power_washing || null,
      damage_extent: body.damage_extent || null,
      texture_match: body.texture_match || null,
      photos: body.photos || null,
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([insertBody])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // ── Insert photo records into job_photos ─────────────────────────────────
    if (body.photos && Array.isArray(body.photos) && body.photos.length > 0) {
      const photoRecords = body.photos.map((url: string) => ({
        job_id: job.id,
        url,
        filename: url.split('/').pop() || 'photo',
        file_size: null,
      }))
      await supabase.from('job_photos').insert(photoRecords)
    }

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

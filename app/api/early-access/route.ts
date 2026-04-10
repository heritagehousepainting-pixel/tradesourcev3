import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// POST /api/early-access — capture early access form submissions
// Public endpoint — no auth required.
// Submissions tagged as "early_access" for differentiation from full applications.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, county, work_type } = body

    if (!name?.trim() || !email?.trim() || !county?.trim() || !work_type?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('early_access_submissions')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        county: county.trim(),
        work_type: work_type.trim(),
      }])
      .select()
      .single()

    if (error) {
      // If the table doesn't exist yet, create it via raw SQL and retry once.
      if (error.code === '42P01') {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS early_access_submissions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            county TEXT NOT NULL,
            work_type TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          ALTER TABLE early_access_submissions ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "public_insert_early_access" ON early_access_submissions
            FOR INSERT WITH CHECK (true);
          CREATE POLICY "admin_read_early_access" ON early_access_submissions
            FOR SELECT USING (
              (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
            );
        `)
        // Retry insert
        const retry = await supabase
          .from('early_access_submissions')
          .insert([{ name: name.trim(), email: email.trim().toLowerCase(), county: county.trim(), work_type: work_type.trim() }])
          .select()
          .single()
        if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 })
        return NextResponse.json({ success: true, id: retry.data?.id }, { status: 200 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

// GET /api/early-access — admin only: list all submissions
export async function GET(request: Request) {
  try {
    const { getServerUserAccess } = await import('@/lib/auth/access.server')
    const access = await getServerUserAccess(request as unknown as NextRequest)
    if (!access.isAuthenticated || !access.canViewApplicationPortal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('early_access_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdminClient } from '@/lib/supabase/server-only'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password, ...fields } = body

    // Map camelCase form fields to snake_case DB columns
    // Note: business_name does not exist in the DB; use company for business name
    const contractorData = {
      name: fields.fullName || fields.name || '',
      full_name: fields.fullName || fields.name || '',
      company: fields.businessName || fields.company || '',
      email: fields.email,
      phone: fields.phone || '',
      license_number: fields.licenseNumber || fields.license_number || '',
      license_state: fields.license_state || '',
      years_in_trade: fields.years_in_trade || fields.yearsInTrade || 0,
      trade_specialization: 'painting',
    }

    // Hash password for our contractor_applications table
    const password_hash = password
      ? await bcrypt.hash(password, 10)
      : null

    const supabaseAdmin = await getSupabaseAdminClient()

    // Insert into contractor_applications
    const { data: contractor, error: contractorError } = await supabaseAdmin
      .from('contractor_applications')
      .insert([{ ...contractorData, password_hash }])
      .select()
      .single()

    if (contractorError) {
      return NextResponse.json({
        error: contractorError.message,
        hint: contractorError.hint,
        details: contractorError.details,
      }, { status: 500 })
    }

    // Also create a Supabase Auth user so they can sign in via supabase.auth.signInWithPassword()
    // Store the contractor_id in their auth metadata for session retrieval
    if (password && contractor?.id) {
      const { error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: contractorData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          contractor_id: contractor.id,
          name: contractorData.name,
          company: contractorData.company,
        },
      })

      // If Supabase Auth user creation fails, log but don't fail the application
      if (signUpError) {
        console.error('Supabase Auth user creation failed:', signUpError.message)
      }
    }

    return NextResponse.json(contractor)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

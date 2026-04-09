import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdminClient } from '@/lib/supabase/server-only'

// Helper: upload a file to Supabase Storage and return the public URL
async function uploadDocumentToStorage(
  supabaseAdmin: ReturnType<typeof import('@/lib/supabase/server-only').getSupabaseAdminClient>,
  file: File,
  contractorEmail: string,
  docType: 'w9' | 'insurance'
): Promise<string | null> {
  try {
    const bucket = 'contractor-documents'
    const ext = file.name.split('.').pop() || 'pdf'
    const path = `${contractorEmail.replace(/[^a-zA-Z0-9]/g, '_')}/${docType}_${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
    if (uploadError) {
      console.error(`Storage upload failed for ${docType}:`, uploadError.message)
      return null
    }
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    return urlData?.publicUrl || null
  } catch (err) {
    console.error(`Storage exception for ${docType}:`, err)
    return null
  }
}

export async function POST(request: Request) {
  try {
    // Support both JSON (metadata only) and FormData (with actual files)
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown> = {}
    let w9File: File | null = null
    let insuranceFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (key === 'w9') w9File = value
          else if (key === 'insurance') insuranceFile = value
        } else {
          try { body[key] = JSON.parse(value as string) }
          catch { body[key] = value }
        }
      }
    } else {
      body = await request.json()
    }

    const { password, ...fields } = body

    const supabaseAdmin = await getSupabaseAdminClient()
    const email = (fields.email as string) || (fields.email_address as string) || ''

    // Upload documents to Supabase Storage (if files were provided)
    let w9_url: string | null = null
    let insurance_url: string | null = null

    if (w9File) {
      w9_url = await uploadDocumentToStorage(supabaseAdmin as any, w9File, email, 'w9')
    }
    if (insuranceFile) {
      insurance_url = await uploadDocumentToStorage(supabaseAdmin as any, insuranceFile, email, 'insurance')
    }

    // Map camelCase form fields to snake_case DB columns
    const contractorData: Record<string, unknown> = {
      name: fields.fullName || fields.name || '',
      full_name: fields.fullName || fields.name || '',
      company: fields.businessName || fields.company || '',
      email: email,
      phone: (fields.phone as string) || '',
      license_number: (fields.licenseNumber as string) || (fields.license_number as string) || '',
      license_state: (fields.license_state as string) || '',
      years_in_trade: (fields.years_in_trade as number) || (fields.yearsInTrade as number) || 0,
      trade_specialization: 'painting',
      // Document URLs from Supabase Storage
      w9_url: w9_url,
      insurance_url: insurance_url,
    }

    // Hash password for our contractor_applications table
    const password_hash = password
      ? await bcrypt.hash(password as string, 10)
      : null

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
    if (password && contractor?.id) {
      const { data: authUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: contractorData.email as string,
        password: password as string,
        email_confirm: true,
        user_metadata: {
          contractor_id: contractor.id,
          name: contractorData.name,
          company: contractorData.company,
        },
      })

      // Bridge auth user ID to contractor row for RLS policy checks
      if (authUser?.id) {
        await supabaseAdmin
          .from('contractor_applications')
          .update({ auth_user_id: authUser.id })
          .eq('id', contractor.id)
      }

      if (signUpError) {
        console.error('Supabase Auth user creation failed:', signUpError.message)
      }
    }

    return NextResponse.json(contractor)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

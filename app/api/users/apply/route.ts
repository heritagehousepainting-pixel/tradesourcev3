import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

// Helper: upload a file to Supabase Storage and return the public URL
async function uploadDocumentToStorage(
  supabaseAdmin: SupabaseClient,
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _removed, ...fields } = body

    const supabaseAdmin = await getSupabaseAdminClient()
    const email =
      (fields.email as string) ||
      (fields.email_address as string) ||
      ''

    // ── Server-side required document validation ──────────────────────────────────
    // The browser UI enforces this client-side, but the API must also enforce it
    // so that direct calls cannot bypass the required document requirement.
    const isMultipart = contentType.includes('multipart/form-data')
    if (isMultipart && (!w9File || !insuranceFile)) {
      return NextResponse.json(
        {
          error: 'Both W-9 and proof of insurance documents are required to apply.',
          field: !w9File && !insuranceFile ? 'w9_and_insurance' : !w9File ? 'w9' : 'insurance',
        },
        { status: 400 }
      )
    }

    // Upload documents to Supabase Storage (if files were provided)
    let w9_url: string | null = null
    let insurance_url: string | null = null

    if (w9File) {
      w9_url = await uploadDocumentToStorage(supabaseAdmin as any, w9File, email, 'w9')
    }
    if (insuranceFile) {
      insurance_url = await uploadDocumentToStorage(supabaseAdmin as any, insuranceFile, email, 'insurance')
    }

    // Map form fields (both camelCase and snake_case) to DB columns.
    // Browser form sends snake_case: full_name, business_name.
    // Map form fields (both camelCase and snake_case) to DB columns.
    // Browser form sends snake_case: full_name, business_name, service_areas, trade_types.
    const g = (key: string) => (fields[key] as string | undefined) ?? ''
    const gNum = (k1: string, k2: string) => (fields[k1] ?? fields[k2] ?? 0) as number
    const nameVal = g('fullName') || g('name') || g('full_name') || ''

    // Parse comma-joined arrays into Supabase-compatible text[] arrays.
    // The form sends service_areas as 'Philadelphia,Montgomery County,...' (single string).
    const parseArray = (key: string): string[] => {
      const raw = fields[key]
      if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
      if (typeof raw === 'string' && raw.trim()) return raw.split(',').map(s => s.trim()).filter(Boolean)
      return []
    }

    // ── Email uniqueness check ──────────────────────────────────────────────────
    const { data: existingByEmail } = await supabaseAdmin
      .from('contractor_applications')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .single()

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'An application has already been submitted with this email address. Check your inbox for a confirmation email, or contact us if you need help.', field: 'email' },
        { status: 409 }
      )
    }

    const contractorData: Record<string, unknown> = {
      name: nameVal,
      full_name: nameVal,
      company: g('businessName') || g('company') || g('business_name') || '',
      email: email.toLowerCase().trim(),
      phone: g('phone') || null,
      license_number: g('licenseNumber') || g('license_number') || '',
      license_state: g('license_state') || 'PA',
      years_in_trade: gNum('yearsInTrade', 'years_in_trade'),
      trade_specialization: 'painting',
      external_link: g('external_link') || null,
      w9_url,
      insurance_url,
      // New fields that were missing:
      service_areas: parseArray('service_areas'),
      trade_types: parseArray('trade_types'),
      bio: g('bio') || null,
      website_url: g('website_url') || null,
      years_experience: gNum('years_experience', 'yearsExperience'),
      status: 'pending_review',
    }

    const { data: contractor, error: contractorError } = await supabaseAdmin
      .from('contractor_applications')
      .insert([contractorData])
      .select()
      .single()

    if (contractorError) {
      return NextResponse.json(
        {
          error: contractorError.message,
          hint: contractorError.hint,
          details: contractorError.details,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(contractor)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}

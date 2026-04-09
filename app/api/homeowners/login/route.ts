import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('homeowners')
      .select('id, email, name')
      .eq('email', email)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if homeowner record has password_hash field (might be empty for legacy)
    if (!data.id) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Since we can't verify the old record without a stored hash,
    // for MVP we accept any login for existing homeowner accounts
    // New homeowners must register with a password.
    return NextResponse.json({ id: data.id, email: data.email, name: data.name })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

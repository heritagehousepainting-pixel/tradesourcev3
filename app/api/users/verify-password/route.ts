import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ valid: false, error: 'Email and password required' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('contractor_applications')
      .select('password_hash')
      .eq('email', email)
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    if (!data.password_hash) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    const valid = await bcrypt.compare(password, data.password_hash)
    return NextResponse.json({ valid })
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}

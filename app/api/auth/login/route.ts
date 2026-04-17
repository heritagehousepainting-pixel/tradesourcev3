import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const VALID_EMAIL = 'info@tradesource.app'
    const VALID_PASSWORD = 'Test1234'

    if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Use password grant with service role key to get a session
    const sessionRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: VALID_EMAIL, password: VALID_PASSWORD }),
    })
    const sessionData = await sessionRes.json()

    if (!sessionRes.ok || !sessionData?.access_token) {
      console.error('Session creation failed:', sessionRes.status, JSON.stringify(sessionData))
      return NextResponse.json({ error: 'Could not create session. Please try again.' }, { status: 500 })
    }

    // Build the same cookie format that @supabase/ssr expects
    // It stores session as base64(JSON.stringify({accessToken, refreshToken}))
    const sessionJson = JSON.stringify({
      accessToken: sessionData.access_token,
      refreshToken: sessionData.refresh_token,
      accessTokenExpiresAt: Date.now() + (sessionData.expires_in ?? 3600) * 1000,
      refreshTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      tokenType: 'bearer',
      user: sessionData.user,
    })
    const sessionCookieValue = 'base64-' + Buffer.from(sessionJson).toString('base64')

    // Determine the cookie name that @supabase/ssr expects
    // Format: sb-{short-anon-key-hash}-auth-token
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const shortHash = anonKey.substring(0, 8).replace(/[^a-z0-9]/g, '')
    const authCookieName = `sb-${shortHash}-auth-token`

    const response = NextResponse.json({ ok: true, email, redirectTo: '/admin' })
    
    // Set the session cookie in the format @supabase/ssr expects
    response.cookies.set(authCookieName, sessionCookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: sessionData.expires_in ?? 3600,
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('Founder login error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

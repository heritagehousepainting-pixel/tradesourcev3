import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Canonical redirect: /login is a legacy route.
// All auth should flow through /founder-login.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  return NextResponse.redirect(new URL(`/founder-login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`, request.url))
}
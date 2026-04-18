import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * /signin — canonical contractor-facing sign-in URL.
 *
 * For backward compatibility during migration, this route forwards to
 * /founder-login which hosts the actual form. Once the form is moved to
 * /signin, flip the direction and leave /founder-login as the redirect.
 *
 * Query params (e.g. ?redirect=/dashboard, ?reason=admin_required) are
 * preserved verbatim.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const target = new URL('/founder-login', request.url)
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value))
  return NextResponse.redirect(target, 307)
}

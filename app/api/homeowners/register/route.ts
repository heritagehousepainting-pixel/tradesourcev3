import { NextResponse } from 'next/server'

// Homeowner flow is not live in Phase 1 (painting-only, contractor-first).
// See TRADESOURCE_MVP.md. Endpoint disabled until the homeowner flow is built.
export async function POST() {
  return NextResponse.json(
    { error: 'Homeowner registration is not available in Phase 1.' },
    { status: 410 }
  )
}

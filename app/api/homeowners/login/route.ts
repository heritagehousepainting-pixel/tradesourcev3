import { NextResponse } from 'next/server'

// Homeowner flow is not live in Phase 1. Endpoint disabled.
// Previous implementation had an unsafe bypass path; disabling entirely.
export async function POST() {
  return NextResponse.json(
    { error: 'Homeowner login is not available in Phase 1.' },
    { status: 410 }
  )
}

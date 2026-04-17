/**
 * Minimal analytics tracker for conversion measurement.
 *
 * Uses Supabase service role — no RLS, no user auth required.
 * Session identified by a uuid stored in sessionStorage (survives page navigations
 * within the same browser tab, resets on tab close).
 *
 * Usage:
 *   import { track } from '@/lib/analytics'
 *   track({ event_type: 'cta_click', event_name: 'hero_apply_click', properties: { location: 'hero' } })
 */

import { createClient } from '@supabase/supabase-js'

let _sessionId: string | null = null

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  if (_sessionId) return _sessionId
  const stored = sessionStorage.getItem('ts_session_id')
  if (stored) { _sessionId = stored; return stored }
  const id = crypto.randomUUID()
  sessionStorage.setItem('ts_session_id', id)
  _sessionId = id
  return id
}

type EventProperties = Record<string, string | number | boolean | null>

type TrackEvent = {
  event_type: string
  event_name: string
  properties?: EventProperties
  duration_ms?: number
}

/**
 * Fire-and-forget — errors are swallowed so analytics never breaks the UX.
 * Logs to console in development so you can verify events are firing correctly.
 */
export function track(event: TrackEvent) {
  if (typeof window === 'undefined') return

  const payload = {
    event_type: event.event_type,
    event_name: event.event_name,
    properties: { ...event.properties, url: window.location.pathname } as EventProperties,
    session_id: getSessionId(),
    created_at: new Date().toISOString(),
  }

  // Console log in dev
  if (process.env.NODE_ENV === 'development') {
    console.log('[track]', event.event_type, event.event_name, payload.properties)
  }

  // Non-blocking POST — does not await response
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

/** Track a CTA click with location context */
export function trackClick(label: string, location: string) {
  track({ event_type: 'cta_click', event_name: label, properties: { location } })
}

/** Track apply flow step progression */
export function trackApplyStep(step: number, direction: 'next' | 'back') {
  track({ event_type: 'apply_step', event_name: `step_${step}`, properties: { direction } })
}

/** Track successful application submission */
export function trackApplySubmit() {
  track({ event_type: 'apply_submit', event_name: 'application_submitted', properties: {} })
}

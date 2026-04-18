/**
 * /jobs — Browse Jobs page (Server Component wrapper)
 *
 * Server-fetches jobs on the server so the initial HTML contains real job cards,
 * not an empty-state or loading skeleton. Checks auth server-side using the
 * service role key so the auth nudge renders in the initial HTML.
 */
import JobsClient from './JobsClient'
import { createClient } from '@supabase/supabase-js'
import { getServerUserAccessFromCookies } from '@/lib/auth/access.server'

export const metadata = {
  title: 'Browse Jobs — TradeSource',
  description: 'View open overflow painting jobs on the TradeSource private contractor network.',
}

export default async function JobsPage() {
  let initialJobs: any[] = []
  let isAuthenticated = false

  try {
    const access = await getServerUserAccessFromCookies()
    isAuthenticated = !!access?.isAuthenticated
  } catch {
    // Non-fatal — client will still resolve auth state
  }

  const networkContext = {
    vettingNote:
      'Only verified contractors can post or express interest. Every member is vetted before access is granted.',
    accessNote:
      'Full access — posting and expressing interest — requires an approved TradeSource account.',
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data } = await supabase
      .from('jobs')
      .select('id, title, description, area, scope, budget_min, budget_max, status, created_at, poster_id')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)
    initialJobs = data || []
  } catch {
    // Non-fatal — client will fetch and display jobs normally
  }

  return (
    <JobsClient
      initialJobs={initialJobs}
      networkContext={networkContext}
      isAuthenticated={isAuthenticated}
    />
  )
}

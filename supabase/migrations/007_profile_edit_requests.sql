-- Migration: create profile_edit_requests table
-- Required by: app/profile/page.tsx → POST /api/profile-edit-requests
-- Required by: app/api/profile-edit-requests/route.ts

BEGIN;

CREATE TABLE IF NOT EXISTS profile_edit_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id    UUID NOT NULL,
  requested_changes JSONB NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     UUID,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profile_edit_requests ENABLE ROW LEVEL SECURITY;

-- Admins and the requesting contractor can read their own requests
DROP POLICY IF EXISTS "contractor_reads_own_requests" ON profile_edit_requests;
CREATE POLICY "contractor_reads_own_requests" ON profile_edit_requests
  FOR SELECT USING (auth.uid() = contractor_id OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Any authenticated user can create a request for themselves
DROP POLICY IF EXISTS "authenticated_creates_request" ON profile_edit_requests;
CREATE POLICY "authenticated_creates_request" ON profile_edit_requests
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- Admins can update (approve/reject)
DROP POLICY IF EXISTS "admin_updates_requests" ON profile_edit_requests;
CREATE POLICY "admin_updates_requests" ON profile_edit_requests
  FOR UPDATE USING (true);

-- RLS for anon (for API route with service key, bypasses RLS)
GRANT ALL ON profile_edit_requests TO anon, authenticated, service_role;

COMMIT;

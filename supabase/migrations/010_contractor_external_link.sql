-- Migration: 010_contractor_external_link
-- Adds the founder-confirmed external review link field to contractor_applications.
-- Required by founder vetting checklist: "one external link (Google Business Profile, social media, website, or review site)"

ALTER TABLE contractor_applications
ADD COLUMN IF NOT EXISTS external_link TEXT;

-- RLS: contractors can only read their own external_link; admins see all
CREATE POLICY IF NOT EXISTS "contractors_read_own_external_link"
  ON contractor_applications FOR SELECT
  USING (
    auth.uid() = contractor_applications.auth_user_id
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- RLS: only admin can insert/update external_link (set by apply flow which uses service role)
CREATE POLICY IF NOT EXISTS "admin_insert_external_link"
  ON contractor_applications FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR contractor_applications.auth_user_id IS NULL
  );

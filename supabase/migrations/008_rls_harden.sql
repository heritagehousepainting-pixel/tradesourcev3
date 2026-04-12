-- Migration 008: RLS Hardening + Auth Bridge
--
-- Two critical problems fixed:
-- 1. All tables had "FOR ALL USING (true)" — anon could read AND WRITE everything.
--    contractor_applications INSERT was wide open → anyone could spam fake applications.
-- 2. No bridge between auth.uid() and contractor_applications.id (different UUIDs).
--    RLS policies that check "auth.uid() = contractor_id" fail for contractors whose
--    UUIDs don't happen to match their auth user UUIDs (common).
--
-- Solution:
-- - Add auth_user_id UUID column to contractor_applications
-- - Backfill existing contractors' auth_user_ids from auth metadata
-- - Apply targeted RLS policies using auth_user_id bridge
-- - Founder/admin identified via auth.jwt() -> app_metadata -> role = 'admin'
--   (set when creating founder admin via Admin API)
--
-- HOW TO APPLY:
--   Run in Supabase Dashboard → SQL Editor (not supabase CLI, which can't run DDL).
--   Click "New Query" → paste this entire file → click "Run".

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 1: Add auth_user_id bridge column to contractor_applications
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE contractor_applications
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contractor_applications_auth_user_id
  ON contractor_applications(auth_user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 2: Backfill auth_user_id for existing contractors
-- (Links contractor_applications.id → auth.users.id via email or metadata)
-- ─────────────────────────────────────────────────────────────────────────
UPDATE contractor_applications ca
SET auth_user_id = au.id
FROM auth.users au
WHERE au.email = ca.email
  AND ca.auth_user_id IS NULL;

-- For contractors whose auth users have contractor_id in metadata
-- (covers cases where email changed or multiple contractors share an email edge case)
UPDATE contractor_applications ca
SET auth_user_id = au.id
FROM auth.users au,
     jsonb_array_elements_text(au.raw_user_meta_data->'role'::text) AS roles
WHERE au.raw_user_meta_data->>'contractor_id' = ca.id::text
  AND ca.auth_user_id IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 3: Set founder/admin role in app_metadata for Admin API-created users
-- (Sets role='admin' for the founder so RLS can detect admins via auth.jwt())
-- ─────────────────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'),
    '{role}',
    '"admin"'
  )
WHERE email = 'info@tradesource.app'
  AND (raw_app_meta_data->>'role') IS DISTINCT FROM 'admin';

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 4: Drop all permissive "Allow all" policies
-- ─────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all on contractor_applications" ON contractor_applications;
DROP POLICY IF EXISTS "Allow all on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow all on job_interests" ON job_interests;
DROP POLICY IF EXISTS "Allow all on notification_preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Allow all on notification_queue" ON notification_queue;
DROP POLICY IF EXISTS "Allow all on homeowners" ON homeowners;
DROP POLICY IF EXISTS "Allow all on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow all on message_threads" ON message_threads;
DROP POLICY IF EXISTS "Allow all on messages" ON messages;

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 5: contractor_applications policies
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT: founders/admins see all; contractors see only their own row via auth_user_id bridge
DROP POLICY IF EXISTS "contractor_select_own_or_admin" ON contractor_applications;
CREATE POLICY "contractor_select_own_or_admin" ON contractor_applications
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = auth_user_id
  );

-- INSERT: anyone can submit an application (public apply form)
DROP POLICY IF EXISTS "anon_insert_application" ON contractor_applications;
CREATE POLICY "anon_insert_application" ON contractor_applications
  FOR INSERT WITH CHECK (auth.uid() IS NULL);

-- UPDATE: contractors update their own; admins update any
DROP POLICY IF EXISTS "contractor_update_own_or_admin" ON contractor_applications;
CREATE POLICY "contractor_update_own_or_admin" ON contractor_applications
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = auth_user_id
  );

-- DELETE: admins only (contractors cannot delete their own application)
DROP POLICY IF EXISTS "admin_only_delete_contractor" ON contractor_applications;
CREATE POLICY "admin_only_delete_contractor" ON contractor_applications
  FOR DELETE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 6: jobs policies
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT: public browse (all jobs visible to everyone)
DROP POLICY IF EXISTS "public_browse_jobs" ON jobs;
CREATE POLICY "public_browse_jobs" ON jobs
  FOR SELECT USING (true);

-- INSERT: authenticated users only (job posting)
DROP POLICY IF EXISTS "authenticated_post_jobs" ON jobs;
CREATE POLICY "authenticated_post_jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: poster (homeowner_email matches auth user's email via contractor lookup)
--         OR awarded contractor (contractor_id matches via auth_user_id bridge)
--         OR admin
DROP POLICY IF EXISTS "owner_or_admin_update_jobs" ON jobs;
CREATE POLICY "owner_or_admin_update_jobs" ON jobs
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE email = jobs.homeowner_email)
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = jobs.contractor_id)
  );

-- DELETE: admin only
DROP POLICY IF EXISTS "admin_only_delete_jobs" ON jobs;
CREATE POLICY "admin_only_delete_jobs" ON jobs
  FOR DELETE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 7: job_interests policies
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT: authenticated users see all (for job detail page interest count)
--         OR contractor sees their own interests
DROP POLICY IF EXISTS "auth_select_job_interests" ON job_interests;
CREATE POLICY "auth_select_job_interests" ON job_interests
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT: authenticated contractor only — their own interest
DROP POLICY IF EXISTS "contractor_insert_own_interest" ON job_interests;
CREATE POLICY "contractor_insert_own_interest" ON job_interests
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = job_interests.contractor_id)
  );

-- UPDATE: admin only (for future approve/reject workflow)
DROP POLICY IF EXISTS "admin_only_update_interests" ON job_interests;
CREATE POLICY "admin_only_update_interests" ON job_interests
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- DELETE: contractor deletes their own interest
DROP POLICY IF EXISTS "contractor_delete_own_interest" ON job_interests;
CREATE POLICY "contractor_delete_own_interest" ON job_interests
  FOR DELETE USING (
    auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = job_interests.contractor_id)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 8: reviews policies
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT: public (reviews are public-facing testimonials)
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews
  FOR SELECT USING (true);

-- INSERT: authenticated (only the awarded contractor for a job can be reviewed;
--        这道 policy allows INSERT for any auth user — the API route enforces
--         the business rule of awarded contractor check server-side)
DROP POLICY IF EXISTS "auth_insert_review" ON reviews;
CREATE POLICY "auth_insert_review" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE/DELETE: admin only (moderation)
DROP POLICY IF EXISTS "admin_only_mod_reviews" ON reviews;
CREATE POLICY "admin_only_mod_reviews" ON reviews
  FOR UPDATE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_only_mod_reviews_del" ON reviews;
CREATE POLICY "admin_only_mod_reviews_del" ON reviews
  FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 9: message_threads policies
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT: authenticated; contractors see threads where they are the contractor;
--         founders/admins see all
DROP POLICY IF EXISTS "participant_or_admin_select_threads" ON message_threads;
CREATE POLICY "participant_or_admin_select_threads" ON message_threads
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = message_threads.contractor_id)
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE email = message_threads.homeowner_email)
  );

-- INSERT: authenticated (API route enforces job ownership check server-side)
DROP POLICY IF EXISTS "auth_insert_threads" ON message_threads;
CREATE POLICY "auth_insert_threads" ON message_threads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: participant or admin (mark read, etc.)
DROP POLICY IF EXISTS "participant_or_admin_update_threads" ON message_threads;
CREATE POLICY "participant_or_admin_update_threads" ON message_threads
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = message_threads.contractor_id)
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE email = message_threads.homeowner_email)
  );

-- DELETE: admin only
DROP POLICY IF EXISTS "admin_only_delete_threads" ON message_threads;
CREATE POLICY "admin_only_delete_threads" ON message_threads
  FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 10: messages policies
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT: participant in the thread (checked via subquery on message_threads)
DROP POLICY IF EXISTS "thread_participant_or_admin_select_messages" ON messages;
CREATE POLICY "thread_participant_or_admin_select_messages" ON messages
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
        AND (
          auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = mt.contractor_id)
          OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE email = mt.homeowner_email)
        )
    )
  );

-- INSERT: thread participant
DROP POLICY IF EXISTS "thread_participant_or_admin_insert_messages" ON messages;
CREATE POLICY "thread_participant_or_admin_insert_messages" ON messages
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
        AND (
          auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = mt.contractor_id)
          OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE email = mt.homeowner_email)
        )
    )
  );

-- UPDATE/DELETE: admin only
DROP POLICY IF EXISTS "admin_only_mod_messages" ON messages;
CREATE POLICY "admin_only_mod_messages" ON messages
  FOR UPDATE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_only_mod_messages_del" ON messages;
CREATE POLICY "admin_only_mod_messages_del" ON messages
  FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 11: notification_preferences policies (auth only, owner-scoped)
-- ─────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_select_notif_prefs" ON notification_preferences;
CREATE POLICY "auth_select_notif_prefs" ON notification_preferences
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = notification_preferences.contractor_id)
  );
DROP POLICY IF EXISTS "auth_insert_notif_prefs" ON notification_preferences;
CREATE POLICY "auth_insert_notif_prefs" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "auth_update_notif_prefs" ON notification_preferences;
CREATE POLICY "auth_update_notif_prefs" ON notification_preferences
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = notification_preferences.contractor_id)
  );
DROP POLICY IF EXISTS "auth_delete_notif_prefs" ON notification_preferences;
CREATE POLICY "auth_delete_notif_prefs" ON notification_preferences
  FOR DELETE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.uid() = (SELECT auth_user_id FROM contractor_applications WHERE id = notification_preferences.contractor_id)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 12: notification_queue policies (auth + admin)
-- ─────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_or_admin_select_notif_queue" ON notification_queue;
CREATE POLICY "auth_or_admin_select_notif_queue" ON notification_queue
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "auth_insert_notif_queue" ON notification_queue;
CREATE POLICY "auth_insert_notif_queue" ON notification_queue
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "admin_only_mod_notif_queue" ON notification_queue;
CREATE POLICY "admin_only_mod_notif_queue" ON notification_queue
  FOR UPDATE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_only_mod_notif_queue_del" ON notification_queue;
CREATE POLICY "admin_only_mod_notif_queue_del" ON notification_queue
  FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- STEP 13: homeowners policies (auth only)
-- ─────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_crud_homeowners" ON homeowners;
CREATE POLICY "auth_crud_homeowners" ON homeowners
  FOR ALL USING (auth.uid() IS NOT NULL);

COMMIT;

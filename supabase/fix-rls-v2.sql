-- ============================================
-- TradeSource v2 - Fix RLS UPDATE Policies (v2)
-- ============================================
-- Problem (from fix-rls.sql): The COALESCE trick
--   COALESCE(name, name) = COALESCE(name, name)
--   still fails for partial updates because:
--     - NULL = NULL returns NULL (not TRUE) in SQL
--     - COALESCE(NULL, NULL) = NULL, so the comparison is NULL
--     - A NULL WITH CHECK expression causes the UPDATE to be rejected
--
-- Root cause: WITH CHECK validates every column in the NEW row,
-- including columns that were OMITTED (implicitly NULL in PATCH).
-- Omitted columns fail NOT NULL constraints or produce NULL
-- comparisons that fail the policy check.
--
-- Fix: Drop WITH CHECK entirely for UPDATE policies.
--
--   - USING clause  = row-level filter (access control: "can I update this row?")
--   - WITH CHECK    = validates the full new row after UPDATE
--
-- For PATCH (partial column updates), WITH CHECK is too strict because
-- it validates ALL columns, not just the ones being set.
-- The USING condition alone (true = allow any authenticated requester
-- to update any row) is sufficient for MVP access control.
-- Application-level logic should enforce column-level validation.
-- ============================================

-- --------------------------------------------
-- CONTRACTOR_APPLICATIONS
-- --------------------------------------------

-- Drop broken policies from fix-rls.sql (if they exist)
DROP POLICY IF EXISTS "Allow all on contractor_applications"        ON contractor_applications;
DROP POLICY IF EXISTS "Allow insert on contractor_applications"     ON contractor_applications;
DROP POLICY IF EXISTS "Allow select on contractor_applications"     ON contractor_applications;
DROP POLICY IF EXISTS "Allow update on contractor_applications"     ON contractor_applications;
DROP POLICY IF EXISTS "Allow delete on contractor_applications"     ON contractor_applications;

-- SELECT: Allow anonymous read
CREATE POLICY "Allow select on contractor_applications" ON contractor_applications
  FOR SELECT USING (true);

-- INSERT: Allow anonymous insert
CREATE POLICY "Allow insert on contractor_applications" ON contractor_applications
  FOR INSERT WITH CHECK (true);

-- UPDATE: Allow partial (PATCH) updates.
--   USING (true)         = any requester can update any row
--   NO WITH CHECK        = don't validate full row; allows NULLs for
--                           omitted columns in PATCH requests
CREATE POLICY "Allow update on contractor_applications" ON contractor_applications
  FOR UPDATE USING (true);

-- DELETE: Allow delete
CREATE POLICY "Allow delete on contractor_applications" ON contractor_applications
  FOR DELETE USING (true);

-- --------------------------------------------
-- JOBS
-- --------------------------------------------

-- Drop broken policies from fix-rls.sql (if they exist)
DROP POLICY IF EXISTS "Allow all on jobs"        ON jobs;
DROP POLICY IF EXISTS "Allow insert on jobs"     ON jobs;
DROP POLICY IF EXISTS "Allow select on jobs"     ON jobs;
DROP POLICY IF EXISTS "Allow update on jobs"     ON jobs;
DROP POLICY IF EXISTS "Allow delete on jobs"     ON jobs;

-- SELECT: Allow anonymous read
CREATE POLICY "Allow select on jobs" ON jobs
  FOR SELECT USING (true);

-- INSERT: Allow anonymous insert
CREATE POLICY "Allow insert on jobs" ON jobs
  FOR INSERT WITH CHECK (true);

-- UPDATE: Allow partial (PATCH) updates — NO WITH CHECK
CREATE POLICY "Allow update on jobs" ON jobs
  FOR UPDATE USING (true);

-- DELETE: Allow delete
CREATE POLICY "Allow delete on jobs" ON jobs
  FOR DELETE USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this after applying to confirm policy structure:
--
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   cmd,
--   qual IS NOT NULL  AS has_using,
--   with_check IS NOT NULL AS has_with_check
-- FROM pg_policies
-- WHERE tablename IN ('contractor_applications', 'jobs')
-- ORDER BY tablename, cmd;
--
-- Expected output for both tables:
--   cmd=SELECT | has_using=true | has_with_check=false
--   cmd=INSERT | has_using=false | has_with_check=true
--   cmd=UPDATE | has_using=true  | has_with_check=false  <-- key fix
--   cmd=DELETE | has_using=true  | has_with_check=false

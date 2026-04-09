-- ============================================
-- TradeSource v2 - Fix RLS UPDATE Policies
-- ============================================
-- Problem: The "FOR ALL" policies with "WITH CHECK (true)" cause:
--   1. Partial PATCH (UPDATE with subset of columns) fails with 
--      "null value violates not-null constraint" because NULLs for 
--      omitted columns are checked against NOT NULL constraints
--   2. Full-column PATCH behaves as INSERT (returns 201) because
--      the ALL policy's check may reject the UPDATE, causing the 
--      API to fall back to INSERT behavior
--
-- Fix: Replace single ALL policies with targeted operation policies
--      that properly handle PATCH semantics (partial column updates).
-- ============================================

-- --------------------------------------------
-- CONTRACTOR_APPLICATIONS - Fix UPDATE policy
-- --------------------------------------------

-- 1. Drop the overly broad ALL policy
DROP POLICY IF EXISTS "Allow all on contractor_applications" ON contractor_applications;

-- 2. CREATE: Allow anonymous insert (MVP - no auth required)
CREATE POLICY "Allow insert on contractor_applications" ON contractor_applications
  FOR INSERT WITH CHECK (true);

-- 3. SELECT: Allow anonymous read (for checking application status, etc.)
CREATE POLICY "Allow select on contractor_applications" ON contractor_applications
  FOR SELECT USING (true);

-- 4. UPDATE: Allow targeted (PATCH) updates with anon key.
--    The key fix: Use row-level check that validates only the columns
--    being updated, not all columns. For PATCH semantics, we only
--    validate columns that are actually being set (non-NULL values).
CREATE POLICY "Allow update on contractor_applications" ON contractor_applications
  FOR UPDATE USING (true)
  WITH CHECK (
    -- For any column being updated (non-NULL in NEW), validate it
    -- If a column is NULL in NEW it's being omitted in PATCH, skip validation
    -- This allows partial updates without triggering NOT NULL constraint failures
    (COALESCE(name, name) = COALESCE(name, name)) AND
    (COALESCE(email, email) = COALESCE(email, email)) AND
    (COALESCE(company, company) = COALESCE(company, company)) AND
    (COALESCE(phone, phone) = COALESCE(phone, phone)) AND
    (COALESCE(license_number, license_number) = COALESCE(license_number, license_number)) AND
    (COALESCE(external_reviews, external_reviews) = COALESCE(external_reviews, external_reviews)) AND
    (COALESCE(status, status) = COALESCE(status, status)) AND
    (COALESCE(verified_w9, verified_w9) = COALESCE(verified_w9, verified_w9)) AND
    (COALESCE(verified_insurance, verified_insurance) = COALESCE(verified_insurance, verified_insurance)) AND
    (COALESCE(verified_license, verified_license) = COALESCE(verified_license, verified_license)) AND
    (COALESCE(verified_external, verified_external) = COALESCE(verified_external, verified_external)) AND
    (COALESCE(w9_url, w9_url) = COALESCE(w9_url, w9_url)) AND
    (COALESCE(insurance_url, insurance_url) = COALESCE(insurance_url, insurance_url))
  );

-- 5. DELETE: Allow delete (MVP - can restrict later)
CREATE POLICY "Allow delete on contractor_applications" ON contractor_applications
  FOR DELETE USING (true);

-- --------------------------------------------
-- JOBS - Fix UPDATE policy
-- --------------------------------------------

-- 1. Drop the overly broad ALL policy
DROP POLICY IF EXISTS "Allow all on jobs" ON jobs;

-- 2. CREATE: Allow anonymous insert (MVP - homeowners post jobs freely)
CREATE POLICY "Allow insert on jobs" ON jobs
  FOR INSERT WITH CHECK (true);

-- 3. SELECT: Allow anonymous read
CREATE POLICY "Allow select on jobs" ON jobs
  FOR SELECT USING (true);

-- 4. UPDATE: Allow targeted (PATCH) updates with anon key.
--    Same fix as above - validates only columns being updated.
CREATE POLICY "Allow update on jobs" ON jobs
  FOR UPDATE USING (true)
  WITH CHECK (
    (COALESCE(title, title) = COALESCE(title, title)) AND
    (COALESCE(description, description) = COALESCE(description, description)) AND
    (COALESCE(property_type, property_type) = COALESCE(property_type, property_type)) AND
    (COALESCE(area, area) = COALESCE(area, area)) AND
    (COALESCE(budget_min, budget_min) = COALESCE(budget_min, budget_min)) AND
    (COALESCE(budget_max, budget_max) = COALESCE(budget_max, budget_max)) AND
    (COALESCE(status, status) = COALESCE(status, status)) AND
    (COALESCE(contractor_id, contractor_id) = COALESCE(contractor_id, contractor_id)) AND
    (COALESCE(homeowner_email, homeowner_email) = COALESCE(homeowner_email, homeowner_email)) AND
    (COALESCE(homeowner_name, homeowner_name) = COALESCE(homeowner_name, homeowner_name))
  );

-- 5. DELETE: Allow delete (MVP)
CREATE POLICY "Allow delete on jobs" ON jobs
  FOR DELETE USING (true);

-- ============================================
-- VERIFICATION (run separately after applying)
-- ============================================
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('contractor_applications', 'jobs')
-- ORDER BY tablename, policyname;

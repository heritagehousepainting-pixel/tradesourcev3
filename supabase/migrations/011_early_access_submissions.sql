-- 011_early_access_submissions.sql
-- Creates the early_access_submissions table for homepage "Request Early Access" form
-- HOMEPAGE_ADDITIONS.md Addition 2 — store submissions tagged as "early_access"

CREATE TABLE IF NOT EXISTS early_access_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  county TEXT NOT NULL,
  work_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE early_access_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an early access form (public lead capture)
CREATE POLICY "public_insert_early_access" ON early_access_submissions
  FOR INSERT WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "admin_read_early_access" ON early_access_submissions
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
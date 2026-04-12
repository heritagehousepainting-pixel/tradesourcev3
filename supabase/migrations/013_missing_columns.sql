-- 013_missing_columns.sql
-- Critical columns missing from live code paths:
--   jobs.materials            — used in post-job form + API INSERT
--   jobs.homeowner_phone      — used in post-job form + API INSERT
--   contractor_applications.city           — used in admin panel + contractor profile display
--   contractor_applications.state           — used in admin panel + contractor profile display
--   contractor_applications.business_name   — used in admin panel + contractor profile display
--   contractor_applications.admin_notes     — used in admin panel notes section
--   reviews.reviewee_id        — bidirectional reviews join
--   reviews.visibility        — review visibility toggle

-- jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS materials TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS homeowner_phone TEXT;

-- contractor_applications table
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewee_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

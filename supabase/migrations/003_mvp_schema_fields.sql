-- Comprehensive migration: Add all MVP-required fields to match application schema
-- Run this after 001_add_poster_id.sql and 002_bidirectional_reviews.sql

-- ── contractor_applications ──────────────────────────────────────────────────
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS license_state VARCHAR(50);
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS years_in_trade INTEGER DEFAULT 0;
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS insurance_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE contractor_applications ADD COLUMN IF NOT EXISTS trade_specialization VARCHAR(100) DEFAULT 'painting';
-- rating, review_count, completed_jobs_count are computed on reads — no column needed

-- ── jobs ───────────────────────────────────────────────────────────────────
-- poster_id was added in 001_add_poster_id.sql
-- scope (interior/exterior/both) — maps to 'scope' field already in jobs via property_type
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS timeline VARCHAR(100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sq_footage VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS homeowner_flow BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scope VARCHAR(50); -- 'interior', 'exterior', 'both', 'touchup'

-- ── reviews ───────────────────────────────────────────────────────────────
-- Awarded column was added in 001_add_poster_id.sql
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_type VARCHAR(50); -- 'contractor' or 'homeowner'

-- ── contractor_applications ─────────────────────────────────────────────
-- Rename 'name' to 'full_name' if needed, or map name → full_name
-- The existing 'name' column is fine; we'll use both name and full_name
-- Ensure license_state and years_in_trade are indexed
CREATE INDEX IF NOT EXISTS idx_contractor_applications_license ON contractor_applications(license_state);
CREATE INDEX IF NOT EXISTS idx_contractor_applications_years ON contractor_applications(years_in_trade);

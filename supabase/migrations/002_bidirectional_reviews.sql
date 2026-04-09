-- Migration: Add bidirectional reviews support
-- Currently reviews table only supports homeowner→contractor reviews.
-- This migration adds reviewer context so contractors can also review homeowners
-- after a completed job (both parties rate each other).

-- Add reviewer identification
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_type VARCHAR(50); -- 'contractor' or 'homeowner'
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewed_type VARCHAR(50); -- 'contractor' or 'homeowner'

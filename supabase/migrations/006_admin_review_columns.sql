-- Migration: add admin review columns to contractor_applications
-- Adds notes (admin review notes) and reviewed_at (auto-set on first status decision)
-- Required by: app/api/users/[id]/route.ts PUT allowedFields
-- Required by: app/admin/page.tsx review section

BEGIN;

-- Admin notes from review session
ALTER TABLE contractor_applications
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Timestamp of first reviewer decision (approve/reject)
ALTER TABLE contractor_applications
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

COMMIT;

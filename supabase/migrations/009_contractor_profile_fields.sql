-- Migration 009: Add contractor profile fields and fix apply route field mapping
-- These columns are referenced in the apply route but missing from contractor_applications.

ALTER TABLE contractor_applications
  ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trade_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- Index for area-based contractor lookup
CREATE INDEX IF NOT EXISTS idx_contractor_applications_service_areas
  ON contractor_applications USING GIN (service_areas);

-- Index for trade type filtering
CREATE INDEX IF NOT EXISTS idx_contractor_applications_trade_types
  ON contractor_applications USING GIN (trade_types);

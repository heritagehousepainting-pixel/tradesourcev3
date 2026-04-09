-- Migration: Add password_hash, notification tables, homeowner accounts
-- Run this against Supabase: nuyabfjphadvwctkjlif (tradesource-v2)
-- This adds to the existing schema without dropping anything.

BEGIN;

-- Add password_hash to contractor_applications (safe - adds column if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contractor_applications' AND column_name = 'password_hash') THEN
    ALTER TABLE contractor_applications ADD COLUMN password_hash VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contractor_applications' AND column_name = 'is_pro') THEN
    ALTER TABLE contractor_applications ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add is_verified_homeowner to jobs (safe - adds column if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'is_verified_homeowner') THEN
    ALTER TABLE jobs ADD COLUMN is_verified_homeowner BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractor_applications(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  trade_scope VARCHAR(100) DEFAULT 'painting',
  location_scope VARCHAR(255) DEFAULT 'all',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contractor_id)
);

-- Create notification_queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractor_applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  notification_preference_id UUID REFERENCES notification_preferences(id),
  email VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create homeowners table
CREATE TABLE IF NOT EXISTS homeowners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS to new tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeowners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on notification_preferences" ON notification_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notification_queue" ON notification_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on homeowners" ON homeowners FOR ALL USING (true) WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_contractor ON notification_preferences(contractor_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_jobs_homeowner_email ON jobs(homeowner_email);

-- Add auto-timestamp trigger for notification_preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Add auto-timestamp trigger for homeowners
CREATE OR REPLACE FUNCTION update_homeowners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_homeowners_updated_at ON homeowners;
CREATE TRIGGER update_homeowners_updated_at
  BEFORE UPDATE ON homeowners
  FOR EACH ROW EXECUTE FUNCTION update_homeowners_updated_at();

COMMIT;

-- TradeSource MVP v2 Database Schema
-- Supabase project: nuyabfjphadvwctkjlif (tradesource-v2)
-- Applied: 2026-03-31

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONTRACTOR APPLICATIONS
-- Stores contractor signups and approval status.
-- This is the single user table for v2 MVP (no separate contractors table).
-- ============================================
CREATE TABLE IF NOT EXISTS contractor_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  license_number VARCHAR(100),
  external_reviews TEXT,
  status VARCHAR(50) DEFAULT 'pending_review', -- pending_review, approved, rejected
  verified_w9 BOOLEAN DEFAULT FALSE,
  verified_insurance BOOLEAN DEFAULT FALSE,
  verified_license BOOLEAN DEFAULT FALSE,
  verified_external BOOLEAN DEFAULT FALSE,
  w9_url TEXT,
  insurance_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOBS
-- Homeowner job postings.
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50), -- residential, commercial, industrial, multi-family
  area VARCHAR(255), -- location like "Ambler, PA"
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, cancelled
  contractor_id UUID REFERENCES contractor_applications(id),
  homeowner_email VARCHAR(255),
  homeowner_name VARCHAR(255),
  is_verified_homeowner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOB INTERESTS
-- Tracks which contractors have expressed interest in which jobs.
-- ============================================
CREATE TABLE IF NOT EXISTS job_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractor_applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, contractor_id)
);

-- ============================================
-- NOTIFICATION PREFERENCES
-- Stores contractor notification subscriptions (trade + location alerts).
-- ============================================
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

-- ============================================
-- NOTIFICATION QUEUE
-- Pending notifications to be sent when matching jobs are posted.
-- (Proves the notification system works even without a real email sender.)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractor_applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  notification_preference_id UUID REFERENCES notification_preferences(id),
  email VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- HOMEOWNER ACCOUNTS
-- Simple homeowner accounts for verified job posting.
-- ============================================
CREATE TABLE IF NOT EXISTS homeowners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- Homeowner reviews for completed contractor jobs.
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractor_applications(id) ON DELETE CASCADE,
  homeowner_name VARCHAR(255),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGES
-- Thread-based messaging between homeowners and contractors after a job is awarded.
-- ============================================
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  homeowner_email VARCHAR(255) NOT NULL,
  contractor_id UUID NOT NULL REFERENCES contractor_applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contractor_applications_email ON contractor_applications(email);
CREATE INDEX IF NOT EXISTS idx_contractor_applications_status ON contractor_applications(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_contractor ON jobs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_homeowner_email ON jobs(homeowner_email);
CREATE INDEX IF NOT EXISTS idx_job_interests_job_id ON job_interests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_contractor_id ON job_interests(contractor_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_contractor ON notification_preferences(contractor_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_reviews_contractor ON reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_job ON message_threads(job_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_contractor ON message_threads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- For v2 MVP: allow all operations with anon key to avoid blocking.
-- Restrictive policies can be added after MVP validation.
-- ============================================
ALTER TABLE contractor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeowners ENABLE ROW LEVEL SECURITY;

-- Allow all operations on contractor_applications (anon for MVP)
CREATE POLICY "Allow all on contractor_applications" ON contractor_applications
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on jobs (anon for MVP)
CREATE POLICY "Allow all on jobs" ON jobs
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on job_interests (anon for MVP)
CREATE POLICY "Allow all on job_interests" ON job_interests
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on notification_preferences (anon for MVP)
CREATE POLICY "Allow all on notification_preferences" ON notification_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on notification_queue (anon for MVP)
CREATE POLICY "Allow all on notification_queue" ON notification_queue
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on homeowners (anon for MVP)
CREATE POLICY "Allow all on homeowners" ON homeowners
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all on reviews (anon for MVP)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Allow all on message_threads (anon for MVP)
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on message_threads" ON message_threads FOR ALL USING (true) WITH CHECK (true);

-- Allow all on messages (anon for MVP)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS (auto-timestamps)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractor_applications_updated_at
  BEFORE UPDATE ON contractor_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_interests_updated_at
  BEFORE UPDATE ON job_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_homeowners_updated_at
  BEFORE UPDATE ON homeowners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

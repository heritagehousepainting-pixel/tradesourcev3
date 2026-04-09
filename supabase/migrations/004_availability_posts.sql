-- Migration: Add availability_posts table for contractor "I'm Available" quick signals
-- Allows contractors to post a quick availability signal without creating a full job listing

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS availability_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractor_applications(id) ON DELETE CASCADE,
  trade_type VARCHAR(100) DEFAULT 'painting',
  start_date DATE,
  end_date DATE,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_posts_contractor ON availability_posts(contractor_id);
CREATE INDEX IF NOT EXISTS idx_availability_posts_status ON availability_posts(status);
CREATE INDEX IF NOT EXISTS idx_availability_posts_trade ON availability_posts(trade_type);

ALTER TABLE availability_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on availability_posts" ON availability_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_availability_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_availability_posts_updated_at
  BEFORE UPDATE ON availability_posts
  FOR EACH ROW EXECUTE FUNCTION update_availability_posts_updated_at();

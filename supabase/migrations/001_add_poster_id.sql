-- Migration: Add poster_id to jobs for contractor-to-contractor workflow
-- Allows contractor-posted jobs to be linked back to the poster (contractor_applications.id)

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS poster_id UUID REFERENCES contractor_applications(id) ON DELETE SET NULL;

-- Index for fast lookup of jobs by poster
CREATE INDEX IF NOT EXISTS idx_jobs_poster_id ON jobs(poster_id);

-- Add awarded column to job_interests to mark which contractor was awarded
ALTER TABLE job_interests ADD COLUMN IF NOT EXISTS awarded BOOLEAN DEFAULT FALSE;

-- 012_job_scope_fields.sql
-- Adds structured scope fields to jobs table and creates job_photos table
-- Supports the AI Scope Builder feature on the post-job page

-- ── Structured scope fields on jobs ─────────────────────────────────────────
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS included_areas TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS surfaces TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS prep_requirements TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS repairs_needed TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS occupancy TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS furniture TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS access_notes TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS materials_notes TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS finish_expectations TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS exclusions TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS special_instructions TEXT;
-- Cabinet-specific
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS door_drawer_count TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS current_finish TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS on_site_off_site TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reinstall_responsibility TEXT;
-- Exterior-specific
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stories TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS peeling_priming TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS power_washing TEXT;
-- Drywall-specific
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS damage_extent TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS texture_match TEXT;

-- ── Job photos ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (poster uploads their own photos at posting time)
DROP POLICY IF EXISTS "public_insert_job_photos" ON job_photos;
CREATE POLICY "public_insert_job_photos" ON job_photos
  FOR INSERT WITH CHECK (true);

-- Approved contractors and the job poster can read photos
DROP POLICY IF EXISTS "approved_contractor_read_job_photos" ON job_photos;
CREATE POLICY "approved_contractor_read_job_photos" ON job_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contractor_applications ca
      WHERE ca.id = auth.uid()
        AND ca.status = 'approved'
    )
    OR
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_id
        AND (j.poster_id = auth.uid() OR j.contractor_id = auth.uid())
    )
  );

-- ── Jobs table: add photos array column as convenience ───────────────────────
-- (photos are primarily stored in job_photos; this column holds the public URLs for quick display)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS photos TEXT[];

COMMENT ON COLUMN jobs.photos IS 'Array of public photo URLs stored at posting time for quick access. Full photo metadata is in job_photos.';

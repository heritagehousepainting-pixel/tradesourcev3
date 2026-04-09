-- Migration: Add budget column for fixed-price model
-- TradeSource uses fixed-price (single rate), not min/max ranges
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2);

-- Populate budget from midpoint of budget_min and budget_max for existing jobs
UPDATE jobs SET budget = CASE
  WHEN budget_min IS NOT NULL AND budget_max IS NOT NULL
    THEN round((budget_min + budget_max) / 2, 2)
  WHEN budget_min IS NOT NULL
    THEN budget_min
  WHEN budget_max IS NOT NULL
    THEN budget_max
END
WHERE budget IS NULL;

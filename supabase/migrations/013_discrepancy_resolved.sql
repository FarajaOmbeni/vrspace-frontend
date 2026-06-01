-- Add columns to track discrepancy resolution
ALTER TABLE daily_sales ADD COLUMN discrepancy_resolved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE daily_sales ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE daily_sales ADD COLUMN resolved_by UUID REFERENCES profiles(id);
ALTER TABLE daily_sales ADD COLUMN resolved_with TEXT CHECK (resolved_with IN ('ours', 'partner'));

-- Recalculate shares based on partner_reported_revenue instead of total_revenue
ALTER TABLE daily_sales DROP COLUMN our_share;
ALTER TABLE daily_sales DROP COLUMN partner_share;
ALTER TABLE daily_sales ADD COLUMN our_share NUMERIC(10,2) GENERATED ALWAYS AS (partner_reported_revenue * 0.50) STORED;
ALTER TABLE daily_sales ADD COLUMN partner_share NUMERIC(10,2) GENERATED ALWAYS AS (partner_reported_revenue * 0.50) STORED;

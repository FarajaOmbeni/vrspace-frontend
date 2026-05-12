-- Fix overtime/total hours precision: 2 decimal places causes rounding errors in pay
-- e.g. 2 minutes (0.0333h) rounds to 0.04, giving 16 KES instead of ~13 KES at 400/hr

ALTER TABLE attendance ALTER COLUMN total_hours TYPE NUMERIC(7,4);
ALTER TABLE attendance ALTER COLUMN overtime_hours TYPE NUMERIC(7,4);

-- Recreate trigger function with 4 decimal places
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_closing_hour INTEGER := 22;
  v_closing_time TIMESTAMPTZ;
  v_settings JSONB;
BEGIN
  IF NEW.clock_out IS NOT NULL AND OLD.clock_out IS NULL THEN
    SELECT value INTO v_settings FROM public.settings WHERE key = 'working_hours';
    IF v_settings IS NOT NULL AND v_settings->>'closing_hour' IS NOT NULL THEN
      v_closing_hour := (v_settings->>'closing_hour')::INTEGER;
    END IF;

    NEW.total_hours := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0, 4);

    v_closing_time := date_trunc('day', NEW.clock_out) + (v_closing_hour || ' hours')::INTERVAL;

    IF NEW.clock_out > v_closing_time THEN
      NEW.overtime_hours := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - v_closing_time)) / 3600.0, 4);
    ELSE
      NEW.overtime_hours := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

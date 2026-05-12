-- Fix overtime calculation: timezone-aware
-- Closing hour (e.g. 22) means 22:00 LOCAL time, not UTC
-- Timezone stored in working_hours setting, defaults to Africa/Nairobi

-- Add timezone to working_hours setting
UPDATE settings
SET value = value || '{"timezone": "Africa/Nairobi"}'::jsonb
WHERE key = 'working_hours'
AND value->>'timezone' IS NULL;

-- Recreate trigger with timezone support
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_closing_hour INTEGER := 22;
  v_tz TEXT := 'Africa/Nairobi';
  v_closing_time TIMESTAMPTZ;
  v_settings JSONB;
BEGIN
  IF NEW.clock_out IS NOT NULL AND OLD.clock_out IS NULL THEN
    SELECT value INTO v_settings FROM public.settings WHERE key = 'working_hours';
    IF v_settings IS NOT NULL THEN
      IF v_settings->>'closing_hour' IS NOT NULL THEN
        v_closing_hour := (v_settings->>'closing_hour')::INTEGER;
      END IF;
      IF v_settings->>'timezone' IS NOT NULL THEN
        v_tz := v_settings->>'timezone';
      END IF;
    END IF;

    -- Total hours worked
    NEW.total_hours := TRUNC(EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0, 2);

    -- Closing time = closing hour in LOCAL timezone on the shift date
    v_closing_time := (NEW.date::TEXT || ' ' || v_closing_hour::TEXT || ':00:00')::TIMESTAMP AT TIME ZONE v_tz;

    IF NEW.clock_out > v_closing_time THEN
      IF NEW.clock_in > v_closing_time THEN
        -- Entire shift is after closing
        NEW.overtime_hours := NEW.total_hours;
      ELSE
        -- Partial overtime
        NEW.overtime_hours := TRUNC(EXTRACT(EPOCH FROM (NEW.clock_out - v_closing_time)) / 3600.0, 2);
      END IF;
    ELSE
      NEW.overtime_hours := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalculate existing records using Africa/Nairobi timezone
UPDATE attendance
SET total_hours = TRUNC(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0, 2),
overtime_hours = CASE
  WHEN clock_out > ((date::TEXT || ' 22:00:00')::TIMESTAMP AT TIME ZONE 'Africa/Nairobi')
    AND clock_in > ((date::TEXT || ' 22:00:00')::TIMESTAMP AT TIME ZONE 'Africa/Nairobi')
    THEN TRUNC(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0, 2)
  WHEN clock_out > ((date::TEXT || ' 22:00:00')::TIMESTAMP AT TIME ZONE 'Africa/Nairobi')
    THEN TRUNC(EXTRACT(EPOCH FROM (clock_out - ((date::TEXT || ' 22:00:00')::TIMESTAMP AT TIME ZONE 'Africa/Nairobi'))) / 3600.0, 2)
  ELSE 0
END
WHERE clock_out IS NOT NULL;

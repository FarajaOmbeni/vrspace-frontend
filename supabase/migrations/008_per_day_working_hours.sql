-- Per-day working hours with minute-level precision for overtime calculation
-- Replaces single closing_hour with per-day schedule in working_hours setting

-- Recreate trigger function to support per-day schedule
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_closing_hour INTEGER := 22;
  v_closing_minute INTEGER := 0;
  v_closing_time TIMESTAMPTZ;
  v_settings JSONB;
  v_schedule JSONB;
  v_day_key TEXT;
  v_close_str TEXT;
  v_parts TEXT[];
BEGIN
  IF NEW.clock_out IS NOT NULL AND OLD.clock_out IS NULL THEN
    -- Fetch the working_hours setting
    SELECT value INTO v_settings FROM public.settings WHERE key = 'working_hours';

    IF v_settings IS NOT NULL THEN
      -- Check for new per-day schedule format
      v_schedule := v_settings->'schedule';

      IF v_schedule IS NOT NULL THEN
        -- Map DOW (0=Sun, 1=Mon, ..., 6=Sat) to day name
        v_day_key := CASE EXTRACT(DOW FROM NEW.clock_out)::INTEGER
          WHEN 0 THEN 'sunday'
          WHEN 1 THEN 'monday'
          WHEN 2 THEN 'tuesday'
          WHEN 3 THEN 'wednesday'
          WHEN 4 THEN 'thursday'
          WHEN 5 THEN 'friday'
          WHEN 6 THEN 'saturday'
        END;

        -- Get close time for this day (e.g. "21:30")
        v_close_str := v_schedule->v_day_key->>'close';

        IF v_close_str IS NOT NULL THEN
          v_parts := string_to_array(v_close_str, ':');
          v_closing_hour := v_parts[1]::INTEGER;
          v_closing_minute := v_parts[2]::INTEGER;
        END IF;
      ELSE
        -- Fallback: old format with single closing_hour
        IF v_settings->>'closing_hour' IS NOT NULL THEN
          v_closing_hour := (v_settings->>'closing_hour')::INTEGER;
        END IF;
      END IF;
    END IF;

    -- Total hours worked
    NEW.total_hours := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0, 4);

    -- Build closing time with hour + minute
    v_closing_time := date_trunc('day', NEW.clock_out)
                      + (v_closing_hour || ' hours')::INTERVAL
                      + (v_closing_minute || ' minutes')::INTERVAL;

    -- Overtime = time worked after closing
    IF NEW.clock_out > v_closing_time THEN
      NEW.overtime_hours := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - v_closing_time)) / 3600.0, 4);
    ELSE
      NEW.overtime_hours := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix overtime calculation: migration 008 dropped timezone conversion
-- Closing times in settings are in local time (Africa/Nairobi) but the trigger
-- was comparing against UTC, so overtime only registered past ~1AM local time

CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_closing_hour INTEGER := 22;
  v_closing_minute INTEGER := 0;
  v_closing_time TIMESTAMPTZ;
  v_tz TEXT := 'Africa/Nairobi';
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
      -- Get timezone
      IF v_settings->>'timezone' IS NOT NULL THEN
        v_tz := v_settings->>'timezone';
      END IF;

      -- Check for per-day schedule format
      v_schedule := v_settings->'schedule';

      IF v_schedule IS NOT NULL THEN
        -- Use clock_out in local timezone for day-of-week lookup
        v_day_key := CASE EXTRACT(DOW FROM (NEW.clock_out AT TIME ZONE v_tz))::INTEGER
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

    -- Build closing time in LOCAL timezone, then compare as TIMESTAMPTZ
    v_closing_time := (NEW.date::TEXT || ' ' || LPAD(v_closing_hour::TEXT, 2, '0') || ':' || LPAD(v_closing_minute::TEXT, 2, '0') || ':00')::TIMESTAMP AT TIME ZONE v_tz;

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

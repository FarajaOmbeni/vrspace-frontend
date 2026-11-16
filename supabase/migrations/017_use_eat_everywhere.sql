-- ============================================
-- Migration 017: Use East Africa Time (Africa/Nairobi, UTC+3) everywhere
--
-- Until now "today" in the database was CURRENT_DATE in UTC, so anything
-- logged between 00:00 and 03:00 EAT was filed under the previous day.
--
-- 1. eat_today(): today's date in EAT, used instead of CURRENT_DATE.
-- 2. sessions.date / attendance.date default to eat_today().
-- 3. The employee guard triggers (015/016) and the two "today" permission
--    rules use eat_today().
-- 4. The working-hours time zone setting is pinned to Africa/Nairobi.
-- 5. The database time zone is EAT, so timestamps in the SQL editor and any
--    other CURRENT_DATE / now()::date read in EAT too.
--
-- Run after 015 and 016.
-- ============================================


-- 1. Today in EAT ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.eat_today()
RETURNS DATE
LANGUAGE sql STABLE
AS $$ SELECT (now() AT TIME ZONE 'Africa/Nairobi')::date $$;


-- 2. Column defaults --------------------------------------------------------

ALTER TABLE attendance ALTER COLUMN date SET DEFAULT public.eat_today();
ALTER TABLE sessions ALTER COLUMN date SET DEFAULT public.eat_today();


-- 3a. Attendance guard (same as 016, with eat_today()) ---------------------

CREATE OR REPLACE FUNCTION guard_employee_attendance()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR public.get_user_role() = 'admin' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.clock_in := now();
    NEW.clock_out := NULL;
    NEW.date := public.eat_today();
    NEW.total_hours := NULL;
    NEW.overtime_hours := NULL;
    NEW.created_at := now();
    RETURN NEW;
  END IF;

  -- UPDATE: the only thing an employee may do is clock out, once.
  IF OLD.clock_out IS NOT NULL THEN
    RAISE EXCEPTION 'You have already clocked out for this shift'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.date <> public.eat_today() THEN
    RAISE EXCEPTION 'This shift is from a previous day. Ask an admin to set your clock-out time.'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.clock_out IS NULL
     OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
     OR NEW.clock_in IS DISTINCT FROM OLD.clock_in
     OR NEW.date IS DISTINCT FROM OLD.date
     OR NEW.total_hours IS DISTINCT FROM OLD.total_hours
     OR NEW.overtime_hours IS DISTINCT FROM OLD.overtime_hours
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Employees can only clock out'
      USING ERRCODE = '42501';
  END IF;

  -- Use the server clock, not whatever time the phone sent.
  NEW.clock_out := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- 3b. Session guard (same as 015, with eat_today()) ------------------------

CREATE OR REPLACE FUNCTION guard_employee_session_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_price NUMERIC(10,2);
  v_active BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR public.get_user_role() = 'admin' THEN
    RETURN NEW;
  END IF;

  SELECT price_per_session, is_active
    INTO v_price, v_active
    FROM public.machines
   WHERE id = NEW.machine_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown machine' USING ERRCODE = '23503';
  END IF;
  IF NOT v_active THEN
    RAISE EXCEPTION 'This machine is not active' USING ERRCODE = '42501';
  END IF;

  NEW.price_per_session := v_price;
  NEW.date := public.eat_today();
  NEW.created_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- 3c. "Today" permission rules ---------------------------------------------

DROP POLICY IF EXISTS "Employees can delete own sessions today" ON sessions;
CREATE POLICY "Employees can delete own sessions today"
  ON sessions FOR DELETE
  USING (employee_id = auth.uid() AND date = public.eat_today());

DROP POLICY IF EXISTS "Employees can read today daily_sales" ON daily_sales;
CREATE POLICY "Employees can read today daily_sales"
  ON daily_sales FOR SELECT
  USING (auth.uid() IS NOT NULL AND date = public.eat_today());


-- 4. Pin the working-hours time zone (used by the overtime calculation) ----

UPDATE settings
   SET value = jsonb_set(value, '{timezone}', '"Africa/Nairobi"')
 WHERE key = 'working_hours';


-- 5. Database time zone ------------------------------------------------------
-- Takes effect for new connections; Supabase picks it up within a few minutes.

ALTER DATABASE postgres SET timezone TO 'Africa/Nairobi';


-- ============================================
-- CHECK (optional, read-only): rows filed under a different day than their
-- EAT date. Anything logged between 00:00 and 03:00 EAT before this migration
-- shows up here. If either query returns rows, they can be corrected
-- separately (moving a session also changes that day's daily_sales).
--
-- SELECT id, date, created_at, (created_at AT TIME ZONE 'Africa/Nairobi')::date AS eat_date
--   FROM sessions
--  WHERE date <> (created_at AT TIME ZONE 'Africa/Nairobi')::date;
--
-- SELECT id, employee_id, date, clock_in, (clock_in AT TIME ZONE 'Africa/Nairobi')::date AS eat_date
--   FROM attendance
--  WHERE date <> (clock_in AT TIME ZONE 'Africa/Nairobi')::date;
-- ============================================

-- ============================================
-- Migration 016: Employees can only clock out of today's shift
--
-- Since 015 an employee's clock-out is stamped with the server time. If they
-- forgot to clock out yesterday and do it today, that shift would count every
-- hour overnight as overtime. Previous-day shifts must be closed by an admin
-- (Attendance → Clock out), who picks the real time.
--
-- Same function as 015, plus the date check.
-- ============================================

CREATE OR REPLACE FUNCTION guard_employee_attendance()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR public.get_user_role() = 'admin' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.clock_in := now();
    NEW.clock_out := NULL;
    NEW.date := CURRENT_DATE;
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

  IF OLD.date <> CURRENT_DATE THEN
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

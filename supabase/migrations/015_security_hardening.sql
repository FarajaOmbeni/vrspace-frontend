-- ============================================
-- Migration 015: Security hardening
--
-- 1. New accounts always start as 'employee' (sign-up metadata can no longer
--    grant admin). The create-employee edge function sets the real role.
-- 2. Employees can only clock in/out at the server's current time and can no
--    longer edit clock_in, date, total_hours or overtime_hours.
-- 3. Employees can't choose a session's price or date, and can only delete
--    their own sessions from today.
-- 4. Only admins can add/remove homepage TikTok videos.
-- 5. Expense receipts bucket becomes private (admins read via signed URLs).
--
-- Admins, and server-side contexts with no logged-in user (SQL editor,
-- service role), are not restricted by the new triggers.
--
-- "Today" uses CURRENT_DATE, the same as the existing column defaults and the
-- frontend's toISOString() dates (UTC on Supabase).
-- ============================================


-- ============================================
-- 1. Never trust the role sent in sign-up metadata
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================
-- 2. Attendance: employees can only clock in / clock out "now"
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

-- BEFORE triggers run in alphabetical order. This name sorts before
-- "on_attendance_clock_out", so hours/overtime are calculated from the
-- server-set clock_out.
DROP TRIGGER IF EXISTS attendance_guard_employee ON attendance;
CREATE TRIGGER attendance_guard_employee
  BEFORE INSERT OR UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION guard_employee_attendance();


-- ============================================
-- 3. Sessions: server sets price and date; same-day deletes only
-- ============================================

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
  NEW.date := CURRENT_DATE;
  NEW.created_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS sessions_guard_employee_insert ON sessions;
CREATE TRIGGER sessions_guard_employee_insert
  BEFORE INSERT ON sessions
  FOR EACH ROW EXECUTE FUNCTION guard_employee_session_insert();

DROP POLICY IF EXISTS "Employees can delete own sessions" ON sessions;
CREATE POLICY "Employees can delete own sessions today"
  ON sessions FOR DELETE
  USING (employee_id = auth.uid() AND date = CURRENT_DATE);


-- ============================================
-- 4. TikTok videos: admins only for writes (public read unchanged)
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated insert on tiktok_videos" ON tiktok_videos;
DROP POLICY IF EXISTS "Allow authenticated delete on tiktok_videos" ON tiktok_videos;

CREATE POLICY "Admins can insert tiktok_videos"
  ON tiktok_videos FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete tiktok_videos"
  ON tiktok_videos FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');


-- ============================================
-- 5. Expense receipts: private bucket, admin-only reads
-- ============================================

UPDATE storage.buckets SET public = false WHERE id = 'expense-receipts';

DROP POLICY IF EXISTS "Anyone can view expense receipts" ON storage.objects;
CREATE POLICY "Admins can view expense receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'expense-receipts'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

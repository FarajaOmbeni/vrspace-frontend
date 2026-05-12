-- ============================================
-- VRSpace Internal Management System
-- Migration 001: Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance (clock in/out)
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_out TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, date)
);

-- Machines (VR machines managed via admin CRUD)
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_per_session NUMERIC(10,2) NOT NULL DEFAULT 500.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions (individual VR session logs)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE RESTRICT,
  session_count INTEGER NOT NULL DEFAULT 1 CHECK (session_count > 0),
  price_per_session NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) GENERATED ALWAYS AS (session_count * price_per_session) STORED,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily Sales (daily reconciliation — one row per day)
CREATE TABLE daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  our_share NUMERIC(10,2) GENERATED ALWAYS AS (total_revenue * 0.50) STORED,
  partner_share NUMERIC(10,2) GENERATED ALWAYS AS (total_revenue * 0.50) STORED,
  partner_reported_revenue NUMERIC(10,2),
  discrepancy NUMERIC(10,2),
  logged_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_employee_date ON sessions(employee_id, date);
CREATE INDEX idx_daily_sales_date ON daily_sales(date);

-- ============================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================

-- Get user role from profiles (used by RLS policies)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Calculate hours and overtime when clocking out
-- Overtime = any time worked after the closing hour (default 22:00 / 10 PM)
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_closing_hour INTEGER := 22; -- 10 PM, configurable via settings
  v_closing_time TIMESTAMPTZ;
  v_settings JSONB;
BEGIN
  IF NEW.clock_out IS NOT NULL AND OLD.clock_out IS NULL THEN
    -- Try to get closing hour from settings
    SELECT value INTO v_settings FROM public.settings WHERE key = 'working_hours';
    IF v_settings IS NOT NULL AND v_settings->>'closing_hour' IS NOT NULL THEN
      v_closing_hour := (v_settings->>'closing_hour')::INTEGER;
    END IF;

    -- Total hours worked
    NEW.total_hours := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0, 2);

    -- Overtime = time worked after closing hour
    v_closing_time := date_trunc('day', NEW.clock_out) + (v_closing_hour || ' hours')::INTERVAL;

    IF NEW.clock_out > v_closing_time THEN
      NEW.overtime_hours := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - v_closing_time)) / 3600.0, 2);
    ELSE
      NEW.overtime_hours := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attendance_clock_out
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION calculate_attendance_hours();

-- Compute daily sales from sessions for a given date
CREATE OR REPLACE FUNCTION compute_daily_sales(p_date DATE)
RETURNS void AS $$
DECLARE
  v_total_sessions INTEGER;
  v_total_revenue NUMERIC(10,2);
  v_partner_rev NUMERIC(10,2);
BEGIN
  -- Sum all sessions for the date
  SELECT
    COALESCE(SUM(session_count), 0),
    COALESCE(SUM(total_amount), 0)
  INTO v_total_sessions, v_total_revenue
  FROM sessions
  WHERE date = p_date;

  -- Get existing partner_reported_revenue if row already exists
  SELECT partner_reported_revenue
  INTO v_partner_rev
  FROM daily_sales
  WHERE date = p_date;

  -- Upsert the daily_sales row
  INSERT INTO daily_sales (date, total_sessions, total_revenue, discrepancy)
  VALUES (
    p_date,
    v_total_sessions,
    v_total_revenue,
    CASE WHEN v_partner_rev IS NOT NULL THEN v_total_revenue - v_partner_rev ELSE NULL END
  )
  ON CONFLICT (date) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_revenue = EXCLUDED.total_revenue,
    discrepancy = CASE
      WHEN daily_sales.partner_reported_revenue IS NOT NULL
      THEN EXCLUDED.total_revenue - daily_sales.partner_reported_revenue
      ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-recompute daily_sales when sessions change
CREATE OR REPLACE FUNCTION on_session_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM compute_daily_sales(OLD.date);
    RETURN OLD;
  ELSE
    PERFORM compute_daily_sales(NEW.date);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_insert_update
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION on_session_change();

CREATE TRIGGER on_session_delete
  AFTER DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION on_session_change();

-- Auto-recompute discrepancy when partner_reported_revenue is updated
CREATE OR REPLACE FUNCTION on_partner_revenue_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner_reported_revenue IS DISTINCT FROM OLD.partner_reported_revenue THEN
    NEW.discrepancy := NEW.total_revenue - NEW.partner_reported_revenue;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_daily_sales_partner_update
  BEFORE UPDATE ON daily_sales
  FOR EACH ROW EXECUTE FUNCTION on_partner_revenue_update();

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;

-- PROFILES
-- Everyone can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'admin');

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

-- Admins can update profiles
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (get_user_role() = 'admin');

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (get_user_role() = 'admin');

-- ATTENDANCE
-- Employees can read their own attendance
CREATE POLICY "Employees can read own attendance"
  ON attendance FOR SELECT
  USING (employee_id = auth.uid());

-- Employees can insert their own attendance
CREATE POLICY "Employees can insert own attendance"
  ON attendance FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Employees can update their own attendance (clock out)
CREATE POLICY "Employees can update own attendance"
  ON attendance FOR UPDATE
  USING (employee_id = auth.uid());

-- Admins can do everything on attendance
CREATE POLICY "Admins full access attendance"
  ON attendance FOR ALL
  USING (get_user_role() = 'admin');

-- MACHINES
-- All authenticated users can read active machines
CREATE POLICY "Authenticated users can read machines"
  ON machines FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can do everything on machines
CREATE POLICY "Admins full access machines"
  ON machines FOR ALL
  USING (get_user_role() = 'admin');

-- SESSIONS
-- Employees can read their own sessions
CREATE POLICY "Employees can read own sessions"
  ON sessions FOR SELECT
  USING (employee_id = auth.uid());

-- Employees can insert their own sessions
CREATE POLICY "Employees can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Employees can delete their own sessions (undo)
CREATE POLICY "Employees can delete own sessions"
  ON sessions FOR DELETE
  USING (employee_id = auth.uid());

-- Admins can do everything on sessions
CREATE POLICY "Admins full access sessions"
  ON sessions FOR ALL
  USING (get_user_role() = 'admin');

-- DAILY SALES
-- Employees can read today's daily_sales only
CREATE POLICY "Employees can read today daily_sales"
  ON daily_sales FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND date = CURRENT_DATE
  );

-- Admins can read all daily_sales
CREATE POLICY "Admins can read all daily_sales"
  ON daily_sales FOR SELECT
  USING (get_user_role() = 'admin');

-- Admins can update daily_sales (partner_reported_revenue)
CREATE POLICY "Admins can update daily_sales"
  ON daily_sales FOR UPDATE
  USING (get_user_role() = 'admin');

-- Admins can insert daily_sales
CREATE POLICY "Admins can insert daily_sales"
  ON daily_sales FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

-- ============================================
-- 5. SEED DATA — Machines
-- ============================================

INSERT INTO machines (name, price_per_session) VALUES
  ('Playstation 5', 500.00),
  ('Nintendo', 500.00),
  ('GT Racing', 500.00),
  ('EggVR', 500.00),
  ('HTC Vive', 500.00),
  ('Meta Quest', 500.00);

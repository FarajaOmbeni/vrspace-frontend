-- Add manager role to profiles
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'employee', 'manager'));

-- Manager can read all profiles
CREATE POLICY "managers_read_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

-- Manager can read all attendance
CREATE POLICY "managers_read_attendance" ON attendance
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

-- Manager can read all sessions
CREATE POLICY "managers_read_sessions" ON sessions
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

-- Manager can read all daily_sales
CREATE POLICY "managers_read_daily_sales" ON daily_sales
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

-- Manager can read all machines
-- (machines already allow all authenticated to read, so no extra policy needed)

-- Manager can read finance tables
CREATE POLICY "managers_read_monthly_expenses" ON monthly_expenses
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

CREATE POLICY "managers_read_additional_income" ON additional_income
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

CREATE POLICY "managers_read_monthly_close" ON monthly_close
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

CREATE POLICY "managers_read_expense_templates" ON expense_templates
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

-- Manager can read partner_staff
CREATE POLICY "managers_read_partner_staff" ON partner_staff
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

-- Manager can read settings
CREATE POLICY "managers_read_settings" ON settings
  FOR SELECT TO authenticated
  USING (get_user_role() = 'manager');

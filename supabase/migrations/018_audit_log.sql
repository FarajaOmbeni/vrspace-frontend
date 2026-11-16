-- ============================================
-- Migration 018: Activity log (who changed what)
--
-- Records edits and deletions of money and attendance data, written by
-- database triggers so it can't be skipped or edited from the app. Only
-- admins can read it (Admin → Activity Log).
--
-- Logged:
--   daily_sales        partner figure / notes / resolution changes
--   sessions           edits and deletions (new sessions are normal activity)
--   attendance         admin edits and deletions (manual clock-outs etc.)
--   monthly_expenses   new, edited and deleted expenses
--   additional_income  new, edited and deleted income
--   monthly_close      closing and reopening months
--   profiles           role, salary and active changes
--   machines           price / active / name changes
--   settings           working hours, location, rates
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id    UUID,
  actor_name  TEXT,
  table_name  TEXT NOT NULL,
  row_id      TEXT,
  row_label   TEXT,
  action      TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  changes     JSONB,   -- update: { column: { from, to } }
  snapshot    JSONB    -- insert: new row, delete: old row
);

CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log (at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log (table_name, at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read; nobody can write directly (only the trigger below, which
-- runs as the table owner).
DROP POLICY IF EXISTS "Admins can read audit log" ON audit_log;
CREATE POLICY "Admins can read audit log"
  ON audit_log FOR SELECT
  USING (public.get_user_role() = 'admin');


-- Trigger arguments:
--   TG_ARGV[0]  comma-separated columns to ignore when comparing updates
--   TG_ARGV[1]  'admin_only' to log only changes made by admins
CREATE OR REPLACE FUNCTION audit_row_change()
RETURNS TRIGGER AS $$
DECLARE
  v_ignore  TEXT[] := string_to_array(COALESCE(NULLIF(TG_ARGV[0], ''), ''), ',');
  v_old     JSONB := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END;
  v_new     JSONB := CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN to_jsonb(NEW) END;
  v_row     JSONB := COALESCE(v_new, v_old);
  v_changes JSONB := '{}'::jsonb;
  v_key     TEXT;
  v_actor   UUID := auth.uid();
BEGIN
  IF COALESCE(TG_ARGV[1], '') = 'admin_only' AND public.get_user_role() IS DISTINCT FROM 'admin' THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    FOR v_key IN SELECT jsonb_object_keys(v_new) LOOP
      CONTINUE WHEN v_key = ANY (v_ignore);
      IF (v_old -> v_key) IS DISTINCT FROM (v_new -> v_key) THEN
        v_changes := v_changes || jsonb_build_object(v_key, jsonb_build_object('from', v_old -> v_key, 'to', v_new -> v_key));
      END IF;
    END LOOP;
    IF v_changes = '{}'::jsonb THEN
      RETURN NULL; -- nothing that matters changed
    END IF;
  END IF;

  INSERT INTO public.audit_log (actor_id, actor_name, table_name, row_id, row_label, action, changes, snapshot)
  VALUES (
    v_actor,
    (SELECT full_name FROM public.profiles WHERE id = v_actor),
    TG_TABLE_NAME,
    COALESCE(v_row ->> 'id', v_row ->> 'month', v_row ->> 'key'),
    COALESCE(v_row ->> 'description', v_row ->> 'full_name', v_row ->> 'name', v_row ->> 'key', v_row ->> 'date', v_row ->> 'month'),
    lower(TG_OP),
    CASE WHEN TG_OP = 'UPDATE' THEN v_changes END,
    CASE WHEN TG_OP = 'INSERT' THEN v_new WHEN TG_OP = 'DELETE' THEN v_old END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- daily_sales: totals are recomputed automatically on every session change,
-- so ignore those columns and only log what people enter.
DROP TRIGGER IF EXISTS audit_daily_sales ON daily_sales;
CREATE TRIGGER audit_daily_sales
  AFTER UPDATE ON daily_sales
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('total_sessions,total_revenue,discrepancy,our_share,partner_share,created_at');

DROP TRIGGER IF EXISTS audit_sessions ON sessions;
CREATE TRIGGER audit_sessions
  AFTER UPDATE OR DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('total_amount');

-- attendance: employees' own clock-in/out is normal activity; log admins only.
DROP TRIGGER IF EXISTS audit_attendance ON attendance;
CREATE TRIGGER audit_attendance
  AFTER UPDATE OR DELETE ON attendance
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('', 'admin_only');

DROP TRIGGER IF EXISTS audit_monthly_expenses ON monthly_expenses;
CREATE TRIGGER audit_monthly_expenses
  AFTER INSERT OR UPDATE OR DELETE ON monthly_expenses
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('');

DROP TRIGGER IF EXISTS audit_additional_income ON additional_income;
CREATE TRIGGER audit_additional_income
  AFTER INSERT OR UPDATE OR DELETE ON additional_income
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('');

DROP TRIGGER IF EXISTS audit_monthly_close ON monthly_close;
CREATE TRIGGER audit_monthly_close
  AFTER INSERT OR UPDATE OR DELETE ON monthly_close
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('');

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
  AFTER UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('');

DROP TRIGGER IF EXISTS audit_machines ON machines;
CREATE TRIGGER audit_machines
  AFTER UPDATE OR DELETE ON machines
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('');

DROP TRIGGER IF EXISTS audit_settings ON settings;
CREATE TRIGGER audit_settings
  AFTER UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION audit_row_change('updated_at');

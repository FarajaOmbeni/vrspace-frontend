-- ============================================================
-- Partner Staff tracking
-- Track Company B's front-desk staff who hand clients to our team
-- ============================================================

-- Partner staff table
CREATE TABLE partner_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add partner_staff_id to sessions (nullable - optional for backward compat)
ALTER TABLE sessions
  ADD COLUMN partner_staff_id UUID REFERENCES partner_staff(id) ON DELETE SET NULL;

CREATE INDEX idx_sessions_partner_staff ON sessions(partner_staff_id);
CREATE INDEX idx_partner_staff_active ON partner_staff(is_active);

-- ── RLS ──
ALTER TABLE partner_staff ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read partner staff (needed for dropdown)
CREATE POLICY "Authenticated users can read partner staff"
  ON partner_staff FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can manage partner staff
CREATE POLICY "Admins full access partner staff"
  ON partner_staff FOR ALL
  USING (get_user_role() = 'admin');

-- ── Seed partner staff ──
INSERT INTO partner_staff (full_name) VALUES
  ('Elda'),
  ('Ivy'),
  ('Sophie'),
  ('Grace'),
  ('Stacy'),
  ('Brandy');

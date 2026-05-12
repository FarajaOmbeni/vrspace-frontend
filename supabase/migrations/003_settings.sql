-- Settings table (key-value store for app config)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default shop location (The Waterfront Karen, Nairobi)
INSERT INTO settings (key, value) VALUES
  ('shop_location', '{"lat": -1.3194, "lng": 36.7880, "radius_meters": 100, "name": "VRSpace - The Waterfront Karen"}');

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can read settings"
  ON settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert settings"
  ON settings FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

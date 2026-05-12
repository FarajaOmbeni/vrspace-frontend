-- ============================================
-- Financial Management Tables
-- ============================================

-- Recurring expense definitions
CREATE TABLE expense_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  default_amount NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actual expense entries per month
CREATE TABLE monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'salary', 'one_off')),
  template_id UUID REFERENCES expense_templates(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partial unique indexes (prevent duplicate recurring/salary per month)
CREATE UNIQUE INDEX idx_monthly_expenses_recurring ON monthly_expenses(month, template_id) WHERE type = 'recurring' AND template_id IS NOT NULL;
CREATE UNIQUE INDEX idx_monthly_expenses_salary ON monthly_expenses(month, profile_id) WHERE type = 'salary' AND profile_id IS NOT NULL;

-- Non-VR-session income
CREATE TABLE additional_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Month close status
CREATE TABLE monthly_close (
  month DATE PRIMARY KEY,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id),
  total_income NUMERIC(10,2),
  total_expenses NUMERIC(10,2),
  profit_loss NUMERIC(10,2)
);

-- Indexes
CREATE INDEX idx_monthly_expenses_month ON monthly_expenses(month);
CREATE INDEX idx_additional_income_month ON additional_income(month);

-- ============================================
-- Trigger: block edits when month is closed
-- ============================================

CREATE OR REPLACE FUNCTION check_month_not_closed()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM monthly_close WHERE month = NEW.month AND is_closed = true) THEN
    RAISE EXCEPTION 'Month is closed, no edits allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_expenses_month_closed
  BEFORE INSERT OR UPDATE ON monthly_expenses
  FOR EACH ROW EXECUTE FUNCTION check_month_not_closed();

CREATE TRIGGER check_income_month_closed
  BEFORE INSERT OR UPDATE ON additional_income
  FOR EACH ROW EXECUTE FUNCTION check_month_not_closed();

-- ============================================
-- RLS: Admin full access
-- ============================================

ALTER TABLE expense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_close ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access expense_templates"
  ON expense_templates FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins full access monthly_expenses"
  ON monthly_expenses FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins full access additional_income"
  ON additional_income FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins full access monthly_close"
  ON monthly_close FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- Storage bucket for receipts
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view expense receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'expense-receipts');

CREATE POLICY "Admins can upload expense receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'expense-receipts'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update expense receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'expense-receipts'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete expense receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'expense-receipts'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

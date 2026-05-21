-- ============================================================
-- Add write_off expense type for tax-deductible expenses
-- ============================================================

-- Drop the existing CHECK constraint and re-add with write_off
ALTER TABLE monthly_expenses
  DROP CONSTRAINT IF EXISTS monthly_expenses_type_check;

ALTER TABLE monthly_expenses
  ADD CONSTRAINT monthly_expenses_type_check
  CHECK (type IN ('recurring', 'salary', 'one_off', 'write_off'));

// The single source of truth for how VR revenue and profit/loss are counted.

export const OUR_SHARE_RATE = 0.5

/**
 * Gross VR takings to count for a daily_sales row.
 * Uses the partner's reported figure, unless a discrepancy was resolved in
 * favour of our records. Days the partner hasn't reported yet count as 0.
 */
export function effectiveGross(row) {
  if (row.discrepancy_resolved && row.resolved_with === 'ours') {
    return Number(row.total_revenue || 0)
  }
  if (row.partner_reported_revenue == null) return 0
  return Number(row.partner_reported_revenue) || 0
}

/** Our half of a day's VR takings. */
export function ourShare(row) {
  return effectiveGross(row) * OUR_SHARE_RATE
}

/** The partner's half of a day's VR takings. */
export function partnerShare(row) {
  return effectiveGross(row) * (1 - OUR_SHARE_RATE)
}

/**
 * Partner's figure minus ours: positive means the partner reported more than
 * we logged, negative means less. null when the partner hasn't reported.
 * (The database's `discrepancy` column is the other way round: ours − partner.)
 */
export function partnerDifference(row) {
  if (row.discrepancy == null) return null
  return 0 - Number(row.discrepancy)
}

/** Columns needed by effectiveGross() — select these from daily_sales. */
export const REVENUE_COLUMNS = 'total_revenue, partner_reported_revenue, discrepancy_resolved, resolved_with'

const sum = (rows) => rows.reduce((a, r) => a + Number(r.amount || 0), 0)

/**
 * Income, expenses and profit/loss for a set of finance rows.
 * Write-offs are reported separately and are NOT deducted from profit/loss.
 */
export function financeTotals({ vrRevenue = 0, expenses = [], additionalIncome = [] }) {
  const operational = expenses.filter((e) => e.type !== 'write_off')
  const writeOffs = expenses.filter((e) => e.type === 'write_off')
  const totalAdditionalIncome = sum(additionalIncome)
  const totalIncome = vrRevenue + totalAdditionalIncome
  const totalExpenses = sum(operational)
  return {
    totalIncome,
    totalAdditionalIncome,
    totalExpenses,
    totalWriteOffs: sum(writeOffs),
    profitLoss: totalIncome - totalExpenses,
  }
}

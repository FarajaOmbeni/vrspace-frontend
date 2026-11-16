// Calendar dates are 'YYYY-MM-DD' strings; months are 'YYYY-MM-01'.

const pad = (n) => String(n).padStart(2, '0')

/**
 * The calendar date of `d` on this device.
 * Don't use d.toISOString() for this: it converts to UTC first, so in
 * Nairobi (UTC+3) local midnight becomes the previous day.
 */
export function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * "Today" as stored in the database's date columns. sessions.date and
 * attendance.date are set from CURRENT_DATE, which is the UTC date on
 * Supabase, so queries for "today's" rows must use the UTC date too.
 */
export function dbToday(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

/** 'YYYY-MM-01' for the month containing `d`. */
export function monthStartOf(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
}

/** Moves a 'YYYY-MM-01' month by `delta` months. */
export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  return monthStartOf(new Date(y, m - 1 + delta, 1))
}

/** 'YYYY-MM-01' → { start: first day, end: last day } of that month. */
export function monthRange(month) {
  const [y, m] = month.split('-').map(Number)
  return { start: `${y}-${pad(m)}-01`, end: toDateStr(new Date(y, m, 0)) }
}

/**
 * Date range for the report period buttons.
 * 'week' = Monday to today, 'month' = 1st to today, 'last-month' = all of it,
 * 'custom' = the dates the user typed (either may be blank).
 */
export function periodRange(period, custom = {}, now = new Date()) {
  const today = toDateStr(now)

  if (period === 'week') {
    const day = now.getDay()
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1))
    return { startDate: toDateStr(monday), endDate: today }
  }
  if (period === 'month') {
    return { startDate: monthStartOf(now), endDate: today }
  }
  if (period === 'last-month') {
    const { start, end } = monthRange(shiftMonth(monthStartOf(now), -1))
    return { startDate: start, endDate: end }
  }
  return { startDate: custom.start || undefined, endDate: custom.end || undefined }
}

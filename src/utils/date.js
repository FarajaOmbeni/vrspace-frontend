// All dates and times in the app are East Africa Time (Africa/Nairobi, UTC+3),
// whatever time zone the phone or computer is set to. The database uses the
// same rule (eat_today(), migration 017).
//
// Calendar dates are 'YYYY-MM-DD' strings; months are 'YYYY-MM-01'.

export const VENUE_TZ = 'Africa/Nairobi'

const pad = (n) => String(n).padStart(2, '0')

const formatters = {}
function partsFormatter(tz) {
  formatters[tz] ||= new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hourCycle: 'h23',
  })
  return formatters[tz]
}

/** EAT wall-clock view of an instant: { date, weekday ('monday'…), minutes after midnight }. */
export function zonedParts(instant, tz = VENUE_TZ) {
  const p = Object.fromEntries(partsFormatter(tz).formatToParts(new Date(instant)).map((x) => [x.type, x.value]))
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    weekday: p.weekday.toLowerCase(),
    minutes: Number(p.hour) * 60 + Number(p.minute),
  }
}

/** The instant when the EAT wall clock reads `minutes` after midnight on `dateStr`. */
export function zonedTimeToDate(dateStr, minutes, tz = VENUE_TZ) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const guess = Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60)
  const wall = zonedParts(guess, tz)
  const [wy, wmo, wd] = wall.date.split('-').map(Number)
  const wallAsUtc = Date.UTC(wy, wmo - 1, wd, Math.floor(wall.minutes / 60), wall.minutes % 60)
  return new Date(guess - (wallAsUtc - guess))
}

/** The EAT calendar date of an instant (a Date, timestamp or ISO string). */
export function toDateStr(instant) {
  return zonedParts(instant).date
}

/** Today's date in EAT. */
export function todayEAT(now = new Date()) {
  return toDateStr(now)
}

/** 'YYYY-MM-DD' plus `n` days (n may be negative). */
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** 'YYYY-MM-01' for the EAT month containing an instant. */
export function monthStartOf(instant) {
  return `${toDateStr(instant).slice(0, 7)}-01`
}

/** Moves a 'YYYY-MM-01' month by `delta` months. */
export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-01`
}

/** 'YYYY-MM-01' → { start: first day, end: last day } of that month. */
export function monthRange(month) {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(last)}` }
}

/**
 * Date range for the report period buttons, in EAT.
 * 'week' = Monday to today, 'month' = 1st to today, 'last-month' = all of it,
 * 'custom' = the dates the user typed (either may be blank).
 */
export function periodRange(period, custom = {}, now = new Date()) {
  const today = todayEAT(now)

  if (period === 'week') {
    const [y, m, d] = today.split('-').map(Number)
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 = Sunday
    return { startDate: addDays(today, -(day === 0 ? 6 : day - 1)), endDate: today }
  }
  if (period === 'month') {
    return { startDate: `${today.slice(0, 7)}-01`, endDate: today }
  }
  if (period === 'last-month') {
    const { start, end } = monthRange(shiftMonth(`${today.slice(0, 7)}-01`, -1))
    return { startDate: start, endDate: end }
  }
  return { startDate: custom.start || undefined, endDate: custom.end || undefined }
}

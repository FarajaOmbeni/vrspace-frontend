// Working hours, lateness and pay. `workingHours` is the 'working_hours'
// setting: { hourly_rate, timezone, schedule: { monday: { open: '11:00', close: '22:00' }, ... } }
// (older installs may have { opening_hour, closing_hour } instead of schedule).

import { formatHours } from './format'

export const DEFAULT_TIMEZONE = 'Africa/Nairobi'
export const DEFAULT_HOURLY_RATE = 400
const DEFAULT_OPEN = 11 * 60
const DEFAULT_CLOSE = 22 * 60

export function hourlyRateFrom(workingHours) {
  return Number(workingHours?.hourly_rate) || DEFAULT_HOURLY_RATE
}

export function timezoneFrom(workingHours) {
  return workingHours?.timezone || DEFAULT_TIMEZONE
}

/** Wall-clock view of an instant in a time zone: date, weekday name, minutes after midnight. */
export function zonedParts(instant, tz = DEFAULT_TIMEZONE) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(instant))
      .map((p) => [p.type, p.value])
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday.toLowerCase(),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

/** The instant when the wall clock in `tz` reads `minutes` after midnight on `dateStr`. */
export function zonedTimeToDate(dateStr, minutes, tz = DEFAULT_TIMEZONE) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const guess = Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60)
  const wall = zonedParts(guess, tz)
  const [wy, wmo, wd] = wall.date.split('-').map(Number)
  const wallAsUtc = Date.UTC(wy, wmo - 1, wd, Math.floor(wall.minutes / 60), wall.minutes % 60)
  return new Date(guess - (wallAsUtc - guess))
}

function parseHHMM(value) {
  if (!value) return null
  const [h, m] = String(value).split(':').map(Number)
  return Number.isNaN(h) ? null : h * 60 + (m || 0)
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Opening and closing time (minutes after midnight) for a weekday name. */
export function hoursForDay(workingHours, weekday) {
  if (workingHours?.schedule) {
    const day = workingHours.schedule[weekday]
    return {
      open: parseHHMM(day?.open) ?? DEFAULT_OPEN,
      close: parseHHMM(day?.close) ?? DEFAULT_CLOSE,
    }
  }
  return {
    open: workingHours?.opening_hour != null ? Number(workingHours.opening_hour) * 60 : DEFAULT_OPEN,
    close: workingHours?.closing_hour != null ? Number(workingHours.closing_hour) * 60 : DEFAULT_CLOSE,
  }
}

/** True when someone clocked in after that day's opening time (venue time zone). */
export function isLateClockIn(clockIn, workingHours) {
  if (!clockIn) return false
  const { weekday, minutes } = zonedParts(clockIn, timezoneFrom(workingHours))
  return minutes > hoursForDay(workingHours, weekday).open
}

/** Closing time on a given calendar date, as an instant. */
export function closingTimeOn(dateStr, workingHours) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return zonedTimeToDate(dateStr, hoursForDay(workingHours, weekday).close, timezoneFrom(workingHours))
}

export function overtimePay(overtimeHours, hourlyRate) {
  return Math.round(Number(overtimeHours || 0) * hourlyRate)
}

/** Totals completed attendance rows: { days, totalHours, overtimeHours }. */
export function sumAttendance(records) {
  return records.reduce(
    (acc, r) => ({
      days: acc.days + 1,
      totalHours: acc.totalHours + Number(r.total_hours || 0),
      overtimeHours: acc.overtimeHours + Number(r.overtime_hours || 0),
    }),
    { days: 0, totalHours: 0, overtimeHours: 0 }
  )
}

/**
 * monthly_expenses salary rows for a month: base salary + overtime pay.
 * `attendance` = that month's completed rows ({ employee_id, overtime_hours }).
 */
export function buildSalaryRows({ month, employees, attendance, hourlyRate }) {
  const overtimeByEmployee = {}
  for (const a of attendance) {
    overtimeByEmployee[a.employee_id] = (overtimeByEmployee[a.employee_id] || 0) + Number(a.overtime_hours || 0)
  }

  return employees.map((e) => {
    const otHours = overtimeByEmployee[e.id] || 0
    const otPay = overtimePay(otHours, hourlyRate)
    const description = otHours > 0
      ? `${e.full_name} - Salary (${formatHours(otHours)} OT = +${otPay.toLocaleString('en-KE')} KES)`
      : `${e.full_name} - Salary`
    return {
      month,
      type: 'salary',
      profile_id: e.id,
      description,
      amount: Number(e.salary) + otPay,
    }
  })
}

import { VENUE_TZ } from './date'

/** 1500 → "1,500". Missing values show as "—". */
export function formatPrice(amount) {
  if (amount == null || amount === '') return '—'
  return Number(amount).toLocaleString('en-KE')
}

/** 1.5 → "1h 30m". Rounds to the nearest minute. */
export function formatHours(hours) {
  const totalMinutes = Math.round(Number(hours || 0) * 60)
  const sign = totalMinutes < 0 ? '-' : ''
  const abs = Math.abs(totalMinutes)
  return `${sign}${Math.floor(abs / 60)}h ${abs % 60}m`
}

/** Like formatHours, but shows "—" when there are no hours (e.g. still on shift). */
export function formatHoursOrDash(hours) {
  return hours ? formatHours(hours) : '—'
}

/** Time of day in EAT, e.g. "14:05". Missing values show as "—". */
export function formatTime(instant) {
  if (!instant) return '—'
  return new Date(instant).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', timeZone: VENUE_TZ })
}

/** Calendar date of an instant in EAT, e.g. "17 Nov 2026". Pass Intl options to change the format. */
export function formatInstantDate(instant, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!instant) return '—'
  return new Date(instant).toLocaleDateString('en-KE', { ...options, timeZone: VENUE_TZ })
}

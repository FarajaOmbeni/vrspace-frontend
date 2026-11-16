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

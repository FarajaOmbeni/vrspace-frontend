// CSV export for reports. Opens cleanly in Excel and Google Sheets.
//
//   downloadCsv('sales-2026-11.csv', rows, [
//     { label: 'Date', value: (r) => r.date },
//     { label: 'Revenue (KES)', value: (r) => r.total_revenue },
//   ])

/** One CSV cell: quoted when needed; text that a spreadsheet would run as a formula is neutralised. */
export function csvCell(value) {
  if (value == null) return ''
  let text = String(value)
  // A cell starting with = + - @ can execute as a formula in Excel/Sheets
  // (e.g. a description someone typed). Numbers are left alone.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** rows + [{ label, value: row => any }] → CSV text (CRLF line endings, as Excel expects). */
export function toCsv(rows, columns) {
  const header = columns.map((c) => csvCell(c.label)).join(',')
  const body = rows.map((row) => columns.map((c) => csvCell(c.value(row))).join(','))
  return [header, ...body].join('\r\n')
}

/** Builds the CSV and makes the browser download it. */
export function downloadCsv(filename, rows, columns) {
  // The BOM makes Excel read the file as UTF-8 (names with accents, "—", etc).
  const blob = new Blob(['﻿' + toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

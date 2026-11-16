import { describe, it, expect } from 'vitest'
import { formatPrice, formatHours, formatHoursOrDash } from '../format'
import { toDateStr, dbToday, monthRange, shiftMonth, periodRange } from '../date'
import { effectiveGross, ourShare, partnerDifference, financeTotals } from '../finance'
import {
  isLateClockIn, closingTimeOn, zonedParts, hoursForDay, hourlyRateFrom,
  overtimePay, sumAttendance, buildSalaryRows,
} from '../payroll'

describe('format', () => {
  it('formats prices and shows a dash for missing values', () => {
    expect(formatPrice(1500)).toBe('1,500')
    expect(formatPrice('2500.00')).toBe('2,500')
    expect(formatPrice(0)).toBe('0')
    expect(formatPrice(null)).toBe('—')
  })

  it('formats hours, rolling 60 minutes over to the next hour', () => {
    expect(formatHours(1.5)).toBe('1h 30m')
    expect(formatHours(1.9999)).toBe('2h 0m')
    expect(formatHours(0)).toBe('0h 0m')
    expect(formatHours(-0.5)).toBe('-0h 30m')
    expect(formatHoursOrDash(0)).toBe('—')
    expect(formatHoursOrDash(null)).toBe('—')
    expect(formatHoursOrDash(2.25)).toBe('2h 15m')
  })
})

describe('date', () => {
  it('uses the local calendar date, not UTC', () => {
    // Local midnight on the 1st must stay the 1st (toISOString would give the 31st in UTC+3).
    expect(toDateStr(new Date(2026, 10, 1))).toBe('2026-11-01')
  })

  it('dbToday is the UTC date', () => {
    expect(dbToday(new Date('2026-11-16T22:30:00Z'))).toBe('2026-11-16')
  })

  it('handles month ranges and shifting across years', () => {
    expect(monthRange('2026-02-01')).toEqual({ start: '2026-02-01', end: '2026-02-28' })
    expect(monthRange('2028-02-01').end).toBe('2028-02-29')
    expect(monthRange('2026-11-01')).toEqual({ start: '2026-11-01', end: '2026-11-30' })
    expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01')
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01')
  })

  it('builds report periods', () => {
    const wed = new Date(2026, 10, 18, 15, 0) // Wed 18 Nov 2026
    expect(periodRange('week', {}, wed)).toEqual({ startDate: '2026-11-16', endDate: '2026-11-18' })
    const sun = new Date(2026, 10, 22, 15, 0)
    expect(periodRange('week', {}, sun).startDate).toBe('2026-11-16')
    expect(periodRange('month', {}, wed)).toEqual({ startDate: '2026-11-01', endDate: '2026-11-18' })
    expect(periodRange('last-month', {}, wed)).toEqual({ startDate: '2026-10-01', endDate: '2026-10-31' })
    expect(periodRange('last-month', {}, new Date(2026, 0, 10))).toEqual({ startDate: '2025-12-01', endDate: '2025-12-31' })
    expect(periodRange('custom', { start: '2026-01-05', end: '' })).toEqual({ startDate: '2026-01-05', endDate: undefined })
  })
})

describe('finance', () => {
  const day = { total_revenue: 10000, partner_reported_revenue: 9000, discrepancy: 1000 }

  it("counts the partner's figure by default", () => {
    expect(effectiveGross(day)).toBe(9000)
    expect(ourShare(day)).toBe(4500)
  })

  it('counts our records when a discrepancy was resolved in our favour', () => {
    const resolved = { ...day, discrepancy_resolved: true, resolved_with: 'ours' }
    expect(effectiveGross(resolved)).toBe(10000)
    expect(ourShare(resolved)).toBe(5000)
    expect(effectiveGross({ ...day, discrepancy_resolved: true, resolved_with: 'partner' })).toBe(9000)
  })

  it('counts unreported days as 0', () => {
    expect(effectiveGross({ total_revenue: 5000, partner_reported_revenue: null })).toBe(0)
  })

  it('expresses discrepancies as partner minus ours', () => {
    expect(partnerDifference(day)).toBe(-1000)
    expect(partnerDifference({ discrepancy: -500 })).toBe(500)
    expect(Object.is(partnerDifference({ discrepancy: 0 }), 0)).toBe(true)
    expect(partnerDifference({ discrepancy: null })).toBeNull()
  })

  it('leaves write-offs out of profit/loss', () => {
    const totals = financeTotals({
      vrRevenue: 50000,
      expenses: [
        { type: 'salary', amount: 20000 },
        { type: 'one_off', amount: '5000' },
        { type: 'write_off', amount: 3000 },
      ],
      additionalIncome: [{ amount: 1000 }],
    })
    expect(totals).toEqual({
      totalIncome: 51000,
      totalAdditionalIncome: 1000,
      totalExpenses: 25000,
      totalWriteOffs: 3000,
      profitLoss: 26000,
    })
  })
})

describe('payroll', () => {
  const settings = {
    hourly_rate: 500,
    timezone: 'Africa/Nairobi',
    schedule: {
      monday: { open: '11:00', close: '22:00' },
      saturday: { open: '10:00', close: '23:30' },
    },
  }

  it('reads the per-day schedule, with defaults and the old format', () => {
    expect(hoursForDay(settings, 'saturday')).toEqual({ open: 600, close: 1410 })
    expect(hoursForDay(settings, 'tuesday')).toEqual({ open: 660, close: 1320 })
    expect(hoursForDay({ opening_hour: 9, closing_hour: 21 }, 'monday')).toEqual({ open: 540, close: 1260 })
    expect(hoursForDay(null, 'monday')).toEqual({ open: 660, close: 1320 })
  })

  it('judges lateness in Nairobi time using that day\'s opening time', () => {
    // Sat 21 Nov 2026, 10:30 Nairobi = 07:30 UTC. Saturday opens 10:00 → late.
    expect(isLateClockIn('2026-11-21T07:30:00Z', settings)).toBe(true)
    // Same time on Monday 16 Nov (opens 11:00) → not late.
    expect(isLateClockIn('2026-11-16T07:30:00Z', settings)).toBe(false)
    // Exactly on time is not late.
    expect(isLateClockIn('2026-11-16T08:00:00Z', settings)).toBe(false)
    expect(isLateClockIn('2026-11-16T08:01:00Z', settings)).toBe(true)
    expect(isLateClockIn(null, settings)).toBe(false)
  })

  it('converts between UTC instants and Nairobi wall time', () => {
    expect(zonedParts('2026-11-16T21:30:00Z')).toEqual({ date: '2026-11-17', weekday: 'tuesday', minutes: 30 })
    // Saturday closes 23:30 Nairobi = 20:30 UTC.
    expect(closingTimeOn('2026-11-21', settings).toISOString()).toBe('2026-11-21T20:30:00.000Z')
    expect(closingTimeOn('2026-11-16', settings).toISOString()).toBe('2026-11-16T19:00:00.000Z')
  })

  it('computes overtime pay and attendance totals', () => {
    expect(hourlyRateFrom(settings)).toBe(500)
    expect(hourlyRateFrom(null)).toBe(400)
    expect(overtimePay(1.25, 400)).toBe(500)
    expect(sumAttendance([
      { total_hours: '8.5', overtime_hours: '0.5' },
      { total_hours: 9, overtime_hours: null },
    ])).toEqual({ days: 2, totalHours: 17.5, overtimeHours: 0.5 })
  })

  it('builds salary rows with overtime', () => {
    const rows = buildSalaryRows({
      month: '2026-11-01',
      hourlyRate: 400,
      employees: [
        { id: 'a', full_name: 'Amina', salary: '20000' },
        { id: 'b', full_name: 'Brian', salary: 18000 },
      ],
      attendance: [
        { employee_id: 'a', overtime_hours: '1.5' },
        { employee_id: 'a', overtime_hours: 1 },
        { employee_id: 'b', overtime_hours: 0 },
      ],
    })
    expect(rows).toEqual([
      { month: '2026-11-01', type: 'salary', profile_id: 'a', amount: 21000, description: 'Amina - Salary (2h 30m OT = +1,000 KES)' },
      { month: '2026-11-01', type: 'salary', profile_id: 'b', amount: 18000, description: 'Brian - Salary' },
    ])
  })
})

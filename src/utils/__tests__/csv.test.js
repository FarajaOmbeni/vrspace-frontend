import { describe, it, expect } from 'vitest'
import { csvCell, toCsv } from '../csv'

describe('csv', () => {
  it('quotes cells containing commas, quotes or newlines', () => {
    expect(csvCell('plain')).toBe('plain')
    expect(csvCell('Rent, November')).toBe('"Rent, November"')
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""')
    expect(csvCell('two\nlines')).toBe('"two\nlines"')
  })

  it('leaves numbers alone, including negatives', () => {
    expect(csvCell(1500)).toBe('1500')
    expect(csvCell(-500)).toBe('-500')
    expect(csvCell(0)).toBe('0')
  })

  it('neutralises text that a spreadsheet would run as a formula', () => {
    expect(csvCell('=HYPERLINK("http://x")')).toBe(`"'=HYPERLINK(""http://x"")"`)
    expect(csvCell('+254 729 054 607')).toBe("'+254 729 054 607")
    expect(csvCell('-cash shortfall')).toBe("'-cash shortfall")
    expect(csvCell('@user')).toBe("'@user")
  })

  it('writes blanks for missing values', () => {
    expect(csvCell(null)).toBe('')
    expect(csvCell(undefined)).toBe('')
  })

  it('builds a CSV with a header row and CRLF line endings', () => {
    const csv = toCsv(
      [{ d: '2026-11-17', amt: 1500, note: 'ok' }, { d: '2026-11-18', amt: -200, note: null }],
      [
        { label: 'Date', value: (r) => r.d },
        { label: 'Amount (KES)', value: (r) => r.amt },
        { label: 'Note', value: (r) => r.note },
      ]
    )
    expect(csv).toBe('Date,Amount (KES),Note\r\n2026-11-17,1500,ok\r\n2026-11-18,-200,')
  })
})

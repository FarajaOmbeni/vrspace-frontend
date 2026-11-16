import { describe, it, expect } from 'vitest'
import { fetchAll } from '../fetchAll'

/** Fake Supabase query over `total` rows, capped at `maxRows` per response like PostgREST. */
function fakeTable(total, { maxRows = 1000, withCount = true } = {}) {
  const rows = Array.from({ length: total }, (_, i) => ({ id: i }))
  const calls = []
  const build = () => ({
    range(from, to) {
      calls.push([from, to])
      const end = Math.min(to + 1, from + maxRows)
      return Promise.resolve({ data: rows.slice(from, end), error: null, count: withCount ? total : null })
    },
  })
  return { build, calls }
}

describe('fetchAll', () => {
  it('returns everything when it fits in one page', async () => {
    const t = fakeTable(42)
    expect((await fetchAll(t.build)).length).toBe(42)
    expect(t.calls).toEqual([[0, 999]])
  })

  it('fetches every page past the 1,000-row limit', async () => {
    const t = fakeTable(2500)
    const rows = await fetchAll(t.build)
    expect(rows.length).toBe(2500)
    expect(rows.map((r) => r.id)).toEqual([...Array(2500).keys()])
    expect(t.calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]])
  })

  it('handles exactly 1,000 rows without an extra request', async () => {
    const t = fakeTable(1000)
    expect((await fetchAll(t.build)).length).toBe(1000)
    expect(t.calls.length).toBe(1)
  })

  it("doesn't skip rows when the project's max-rows is below 1,000", async () => {
    const t = fakeTable(1200, { maxRows: 500 })
    const rows = await fetchAll(t.build)
    expect(rows.map((r) => r.id)).toEqual([...Array(1200).keys()])
  })

  it('handles an empty result', async () => {
    expect(await fetchAll(fakeTable(0).build)).toEqual([])
  })

  it('throws query errors', async () => {
    const build = () => ({ range: () => Promise.resolve({ data: null, error: new Error('boom') }) })
    await expect(fetchAll(build)).rejects.toThrow('boom')
  })
})

// Supabase returns at most 1,000 rows per request by default (the project's
// "max rows" setting), silently dropping the rest. Reports that add rows up
// in the browser must fetch every page.

const PAGE_SIZE = 1000

/**
 * Fetches every row of a query, page by page.
 *
 * `buildQuery` must return a fresh query each call, selected with
 * `{ count: 'exact' }` and ordered by a unique column (e.g. `.order('id')`
 * last), so pages don't overlap or skip rows.
 *
 *   const rows = await fetchAll(() =>
 *     supabase.from('sessions').select('*', { count: 'exact' }).gte('date', start).order('id'))
 */
export async function fetchAll(buildQuery) {
  const rows = []
  for (;;) {
    const from = rows.length
    const { data, error, count } = await buildQuery().range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)

    // Advance by what actually came back and stop at the true total (`count`),
    // so this still works if the project's max-rows setting is below PAGE_SIZE
    // (pages then come back shorter than asked for).
    const done = data.length === 0 || (count != null ? rows.length >= count : data.length < PAGE_SIZE)
    if (done) return rows
  }
}

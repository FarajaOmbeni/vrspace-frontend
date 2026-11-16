/* eslint-env node, es2020 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// In-memory localStorage for the node test environment.
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

const server = { rows: new Map(), mode: 'online' } // 'online' | 'offline' | 'reject'
const networkError = Object.assign(new Error('TypeError: Failed to fetch'), { code: '' })

vi.mock('../sessionService', () => ({
  insertSession: vi.fn(async (entry) => {
    if (server.mode === 'offline') throw networkError
    if (server.mode === 'reject') throw Object.assign(new Error('This machine is not active'), { code: '42501' })
    if (server.rows.has(entry.id)) throw Object.assign(new Error('duplicate key'), { code: '23505' })
    server.rows.set(entry.id, entry)
  }),
  isNetworkError: (e) => !e?.code && /fetch/i.test(e?.message || ''),
  isDuplicateError: (e) => e?.code === '23505',
}))

let today = '2026-11-17'
vi.mock('@/utils/date', () => ({ todayEAT: () => today }))

const { logSessionOrQueue, flushPending, pendingSessions, discardPending } = await import('../sessionQueue')

const session = (machineName = 'PS5') => ({ employeeId: 'e1', machineId: 'm1', machineName, sessionCount: 1, pricePerSession: 500 })

beforeEach(() => {
  server.rows.clear()
  server.mode = 'online'
  today = '2026-11-17'
  pendingSessions.value = []
  store.clear()
})

describe('session queue', () => {
  it('sends straight away when online', async () => {
    expect(await logSessionOrQueue(session())).toEqual({ queued: false })
    expect(server.rows.size).toBe(1)
    expect(pendingSessions.value).toEqual([])
  })

  it('keeps sessions on the phone while offline and sends them later, once each', async () => {
    server.mode = 'offline'
    expect(await logSessionOrQueue(session('PS5'))).toEqual({ queued: true })
    expect(await logSessionOrQueue(session('GT'))).toEqual({ queued: true })
    expect(pendingSessions.value.length).toBe(2)
    expect(JSON.parse(store.get('vrspace.pendingSessions')).length).toBe(2) // survives a reload

    expect((await flushPending()).sent).toBe(0) // still offline: nothing lost
    expect(pendingSessions.value.length).toBe(2)

    server.mode = 'online'
    expect((await flushPending()).sent).toBe(2)
    expect(server.rows.size).toBe(2)
    expect(pendingSessions.value).toEqual([])
  })

  it("doesn't double-count a session that already arrived before the reply was lost", async () => {
    server.mode = 'offline'
    await logSessionOrQueue(session())
    const [entry] = pendingSessions.value
    server.rows.set(entry.id, entry) // it actually reached the server
    server.mode = 'online'
    const result = await flushPending()
    expect(result.sent).toBe(1)
    expect(server.rows.size).toBe(1)
  })

  it("doesn't send sessions from a previous day; reports them instead", async () => {
    server.mode = 'offline'
    await logSessionOrQueue(session())
    today = '2026-11-18'
    server.mode = 'online'
    const result = await flushPending()
    expect(result.sent).toBe(0)
    expect(result.stale.length).toBe(1)
    expect(server.rows.size).toBe(0)
    expect(pendingSessions.value).toEqual([])
  })

  it('reports sessions the server refuses instead of retrying forever', async () => {
    server.mode = 'offline'
    await logSessionOrQueue(session())
    server.mode = 'reject'
    const result = await flushPending()
    expect(result.rejected[0].message).toBe('This machine is not active')
    expect(pendingSessions.value).toEqual([])
  })

  it('throws real errors when logging online (nothing queued)', async () => {
    server.mode = 'reject'
    await expect(logSessionOrQueue(session())).rejects.toThrow('not active')
    expect(pendingSessions.value).toEqual([])
  })

  it('lets staff remove a waiting session', async () => {
    server.mode = 'offline'
    await logSessionOrQueue(session())
    discardPending(pendingSessions.value[0].id)
    expect(pendingSessions.value).toEqual([])
  })
})

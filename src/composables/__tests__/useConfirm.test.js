import { describe, it, expect } from 'vitest'
import { useConfirm } from '../useConfirm'

describe('useConfirm', () => {
  it('resolves true when confirmed and false when cancelled', async () => {
    const { confirm, answer, state } = useConfirm()

    const yes = confirm({ title: 'Delete?', confirmLabel: 'Delete' })
    expect(state.open).toBe(true)
    expect(state.title).toBe('Delete?')
    answer(true)
    expect(await yes).toBe(true)
    expect(state.open).toBe(false)

    const no = confirm({ title: 'Reopen?' })
    answer(false)
    expect(await no).toBe(false)
  })

  it('cancels an earlier request if a new one opens', async () => {
    const { confirm, answer } = useConfirm()
    const first = confirm({ title: 'First' })
    const second = confirm({ title: 'Second' })
    answer(true)
    expect(await first).toBe(false)
    expect(await second).toBe(true)
  })
})

import { reactive, readonly } from 'vue'

// One confirmation dialog for the whole admin app (rendered by
// <ConfirmDialog/> in AdminLayout). Usage:
//
//   const { confirm } = useConfirm()
//   if (!(await confirm({ title: 'Delete expense?', message: 'Rent — 30,000 KES', confirmLabel: 'Delete' }))) return

const state = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  danger: true,
})
let resolver = null

function confirm({ title, message = '', confirmLabel = 'Confirm', danger = true }) {
  // A second request while one is open cancels the first.
  resolver?.(false)
  Object.assign(state, { open: true, title, message, confirmLabel, danger })
  return new Promise((resolve) => {
    resolver = resolve
  })
}

function answer(value) {
  state.open = false
  resolver?.(value)
  resolver = null
}

export function useConfirm() {
  return { confirm, answer, state: readonly(state) }
}

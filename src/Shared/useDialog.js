import { watch, nextTick, onBeforeUnmount } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Keyboard and screen-reader behaviour for a popup:
// focus moves into it when it opens, Tab stays inside, Escape closes it,
// and focus goes back to whatever opened it when it closes.
// The dialog element needs role="dialog", aria-modal="true" and tabindex="-1".
export function useDialog(isOpen, dialogEl, close) {
  let opener = null

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key !== 'Tab' || !dialogEl.value) return
    const items = [...dialogEl.value.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    if (!items.length) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    const inside = dialogEl.value.contains(active)
    if (e.shiftKey && (active === first || active === dialogEl.value || !inside)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(isOpen, async (open) => {
    if (open) {
      opener = document.activeElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      dialogEl.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      if (opener?.isConnected) opener.focus({ preventScroll: true })
      opener = null
    }
  })

  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}

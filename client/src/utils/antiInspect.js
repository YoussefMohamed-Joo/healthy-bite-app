export default function antiInspect() {
  document.addEventListener('contextmenu', e => e.preventDefault())

  document.addEventListener('keydown', e => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'u' && !e.shiftKey)
    ) {
      e.preventDefault()
    }
  })

  setInterval(() => {
    (function debug() { debugger })()
  }, 100)
}

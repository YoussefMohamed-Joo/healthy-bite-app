const UPDATE_EVENT = 'hb:update-found'

export function dispatchUpdateFound(data, force) {
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { data, force } }))
}

export function onUpdateFound(handler) {
  const cb = (e) => handler(e.detail.data, e.detail.force)
  window.addEventListener(UPDATE_EVENT, cb)
  return () => window.removeEventListener(UPDATE_EVENT, cb)
}

const API = import.meta.env.VITE_API_URL || ''

let sessionId = localStorage.getItem('track_session_id')
if (!sessionId) {
  sessionId = crypto.randomUUID()
  localStorage.setItem('track_session_id', sessionId)
}

function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return 'android'
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  return 'desktop'
}

export function trackPageVisit(page) {
  try {
    const payload = { page, referrer: document.referrer || '' }
    navigator.sendBeacon(`${API}/track/visit`, JSON.stringify(payload))
  } catch { /* silent */ }
}

export function trackDownload(device) {
  try {
    navigator.sendBeacon(`${API}/track/download`, JSON.stringify({ device }))
  } catch { /* silent */ }
}

export function initTracking() {
  if (typeof window === 'undefined') return

  trackPageVisit(window.location.pathname)

  let lastUrl = window.location.pathname
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastUrl) {
      lastUrl = window.location.pathname
      trackPageVisit(lastUrl)
    }
  })
  observer.observe(document.querySelector('title')?.closest('head') || document.documentElement, {
    subtree: true,
    childList: true,
  })
}

export { getDeviceType }

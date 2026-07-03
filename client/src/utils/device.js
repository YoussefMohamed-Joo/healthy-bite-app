export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  const isCapacitor = window.Capacitor?.isNativePlatform
  if (isCapacitor || /android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios'
  return 'desktop'
}

export function isMobileApp() {
  return getDeviceType() === 'android' || getDeviceType() === 'ios'
}

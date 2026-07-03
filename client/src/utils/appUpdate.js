const API = import.meta.env.VITE_API_URL || 'https://healthybite-server.vercel.app'
const VERSION_KEY = 'hb_app_version'

export function getBundledVersion() {
  const meta = document.querySelector('meta[name="app-version"]')
  return meta?.getAttribute('content') || '1.0.0'
}

export function getLastCheckedVersion() {
  return localStorage.getItem(VERSION_KEY) || '0'
}

export function setLastCheckedVersion(version) {
  localStorage.setItem(VERSION_KEY, version)
}

export async function checkForUpdate() {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch(`${API}/mobile/version`)
    const data = await res.json()
    if (!data?.data?.version) return null
    const latest = data.data.version
    const current = getLastCheckedVersion()
    if (latest !== current && latest !== '1.0.0') {
      setLastCheckedVersion(latest)
      return data.data
    }
    return null
  } catch {
    return null
  }
}

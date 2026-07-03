import { App } from '@capacitor/app'

const API = import.meta.env.VITE_API_URL || 'https://healthybite-server.vercel.app'
const STORED_VERSION_KEY = 'hb_current_version'
const DISMISSED_VERSION_KEY = 'hb_dismissed_version'

function parseVersion(v) {
  const parts = String(v || '0').split('.').map(Number)
  if (parts.length === 1) parts.push(0, 0)
  if (parts.length === 2) parts.push(0)
  return parts
}

function isNewer(latest, current) {
  const l = parseVersion(latest)
  const c = parseVersion(current)
  for (let i = 0; i < 3; i++) {
    if ((l[i] || 0) > (c[i] || 0)) return true
    if ((l[i] || 0) < (c[i] || 0)) return false
  }
  return false
}

export async function getCurrentVersion() {
  if (typeof window === 'undefined') return '0'
  try {
    const info = await App.getInfo()
    if (info?.version) return info.version
  } catch {}
  return localStorage.getItem(STORED_VERSION_KEY) || '1.0.0'
}

async function setCurrentVersion(v) {
  localStorage.setItem(STORED_VERSION_KEY, v)
}

export function getDismissedVersion() {
  return localStorage.getItem(DISMISSED_VERSION_KEY) || '0'
}

function setDismissedVersion(v) {
  localStorage.setItem(DISMISSED_VERSION_KEY, v)
}

export async function fetchUpdateData() {
  const res = await fetch(`${API}/mobile/version`)
  const json = await res.json()
  if (!json?.data?.version) return null
  return json.data
}

export async function checkUpdate() {
  if (typeof window === 'undefined') return null
  try {
    const data = await fetchUpdateData()
    if (!data || !data.version) return null
    const current = await getCurrentVersion()
    if (!isNewer(data.version, current)) return null
    return data
  } catch {
    return null
  }
}

export async function applyUpdate(data) {
  await setCurrentVersion(data.version)
  window.open(data.apkUrl, '_blank')
}

export async function dismissUpdate(data) {
  setDismissedVersion(data.version)
}

export function hasDismissed(version) {
  return getDismissedVersion() === version
}

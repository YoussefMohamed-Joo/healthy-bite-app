import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AuthContext = createContext()

const API = import.meta.env.VITE_API_URL || ''

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = localStorage.getItem('hb_token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' })
  return res
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const refreshRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiFetch('/auth/me')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem('hb_token', data.token || '')
      } catch {
        setUser(null)
        localStorage.removeItem('hb_token')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!user) return
    refreshRef.current = setInterval(async () => {
      try {
        const res = await apiFetch('/auth/refresh', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.token) localStorage.setItem('hb_token', data.token)
        }
      } catch { /* silent */ }
    }, 3 * 60 * 60 * 1000)
    return () => clearInterval(refreshRef.current)
  }, [user])

  const login = useCallback(async (email, password, rememberMe = false) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setUser(data.user)
    if (data.token) localStorage.setItem('hb_token', data.token)
    return data
  }, [])

  const register = useCallback(async (name, email, password, phone, address, rememberMe = false) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, address, rememberMe }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    setUser(data.user)
    if (data.token) localStorage.setItem('hb_token', data.token)
    return data
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    localStorage.removeItem('hb_token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token: '', loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

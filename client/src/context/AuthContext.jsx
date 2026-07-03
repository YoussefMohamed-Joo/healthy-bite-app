import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

const API = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (name, email, password, phone, address) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, phone, address }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    setUser(data.user)
    return data
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token: '', loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

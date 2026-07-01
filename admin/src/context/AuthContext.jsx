import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const API = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin_token', token)
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(u => { if (u.role === 'admin') setUser(u); else logout() }).catch(logout)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    if (data.user.role !== 'admin') throw new Error('ليس لديك صلاحية الدخول')
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('admin_token') }

  return <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!user }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

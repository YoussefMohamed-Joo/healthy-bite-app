import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('hb_dark')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('hb_dark', dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  const toggle = () => setDark(prev => !prev)

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext)
  if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider')
  return ctx
}

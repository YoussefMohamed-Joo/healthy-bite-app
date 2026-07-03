import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, LogOut, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useDarkMode } from '@/context/DarkModeContext'
import { Button } from '@/components/ui/button'
import NotificationBell from '@/components/NotificationBell'

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/plans', label: 'الخطط' },
  { to: '/menu', label: 'المنيو' },
  { to: '/about', label: 'من نحن' },
  { to: '/contact', label: 'تواصل معنا' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { count } = useCart()
  const { user, logout } = useAuth()
  const { dark, toggle } = useDarkMode()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.07)]' : 'shadow-none'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Right side: Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-charcoal font-bold text-xl tracking-tight">
            Helthy <span className="text-primary">Bite</span>
          </span>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const isActive = pathname === l.to
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary-light'
                    : 'text-charcoal hover:text-primary hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Left side: Actions */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-none border-none"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-[20px] h-[20px] text-charcoal" /> : <Moon className="w-[20px] h-[20px] text-charcoal" />}
          </button>

          {/* Notifications */}
          {user && <NotificationBell />}

          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors no-underline">
            <ShoppingCart className="w-[22px] h-[22px] text-charcoal" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[20px] h-[20px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {count}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-charcoal max-w-[90px] truncate">{user.name}</span>
              </button>
              {userMenu && (
                <>
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-charcoal truncate">{user.name}</p>
                      <p className="text-xs text-grey truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-charcoal hover:bg-gray-50 transition-colors no-underline"
                    >
                      حسابي
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-charcoal hover:bg-gray-50 transition-colors no-underline"
                    >
                      طلباتي
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-primary hover:bg-primary-light transition-colors no-underline"
                      >
                        لوحة التحكم
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenu(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="no-underline">
                <Button variant="ghost" size="sm">حسابي</Button>
              </Link>
              <Link to="/signup" className="no-underline">
                <Button size="sm">إنشاء حساب</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-none border-none" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5 text-charcoal" /> : <Menu className="w-5 h-5 text-charcoal" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`        fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg text-charcoal">Helthy Bite</span>
          </div>
          <button className="p-1 cursor-pointer bg-none border-none" onClick={() => setOpen(false)}>
            <X className="w-5 h-5 text-charcoal" />
          </button>
        </div>
        <div className="flex flex-col p-5 gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                pathname === l.to
                  ? 'text-primary bg-primary-light'
                  : 'text-charcoal hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <hr className="my-3 border-gray-100" />
          {user ? (
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-charcoal">{user.name}</p>
              <p className="text-xs text-grey mb-3">{user.email}</p>
              <button
                onClick={() => { logout(); setOpen(false) }}
                className="flex items-center gap-2 text-red-500 text-sm font-medium cursor-pointer bg-none border-none"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-4 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="w-full text-center py-3 rounded-xl text-sm font-medium text-charcoal border border-gray-200 hover:bg-gray-50 no-underline transition-all">
                حسابي
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="w-full text-center py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark no-underline transition-all shadow-md">
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}
    </header>
  )
}

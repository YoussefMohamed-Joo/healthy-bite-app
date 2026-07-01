import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/menu', label: 'المينيو' },
  { to: '/faq', label: 'الأسئلة' },
  { to: '/cart', label: 'العربة' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1320px] mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-extrabold text-lg">H</div>
          <span className="font-cairo font-bold text-xl text-zinc-900">Healthy<span className="text-brand">Bite</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm font-semibold transition-colors ${pathname === l.to ? 'text-brand' : 'text-zinc-600 hover:text-zinc-900'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2">
            <ShoppingBag className="w-5 h-5 text-zinc-700" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      {open && (
        <div className="md:hidden absolute top-[70px] left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-6 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`text-sm font-semibold ${pathname === l.to ? 'text-brand' : 'text-zinc-600'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

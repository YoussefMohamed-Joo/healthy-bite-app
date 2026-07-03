import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogOut, Leaf } from 'lucide-react'
import NewUserAlert from './NewUserAlert'

const sidebarLinks = [
  { section: 'Helthy Bite' },
  { path: '/admin', label: 'الرئيسية', exact: true },
  { path: '/admin/plans', label: 'الخطط' },
  { path: '/admin/products', label: 'المتجر' },
  { path: '/admin/customers', label: 'العملاء' },
  { section: 'Admin' },
  { path: '/admin/current-orders', label: 'الطلبات الحالية' },
  { path: '/admin/orders', label: 'الطلبات' },
  { path: '/admin/payments', label: 'التحقق من الدفع' },
  { path: '/admin/coupons', label: 'كوبونات' },
  { path: '/admin/chats', label: 'المحادثات' },
  { path: '/admin/downloads', label: 'التنزيلات' },
  { path: '/admin/ai', label: '🤖 AI' },
  { path: '/admin/testimonials', label: 'الآراء' },
  { path: '/admin/faq', label: 'الأسئلة' },
  { path: '/admin/settings', label: 'الإعدادات' },
]

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const isActive = (link) => link.exact ? pathname === link.path : pathname.startsWith(link.path)

  return (
    <div className="min-h-screen bg-zinc-50 pt-[70px] flex">
      <aside className="w-56 bg-white border-l border-zinc-100 fixed top-[70px] bottom-0 right-0 z-40 flex flex-col">
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {sidebarLinks.map((link, i) =>
            link.section ? (
              <div key={i} className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 pt-5 pb-1.5">
                {link.section}
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${
                  isActive(link)
                    ? 'bg-brand-light text-brand'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className="border-t border-zinc-100 px-3 py-3 space-y-2">
          <div className="text-xs text-zinc-400 px-3 truncate">{user?.email}</div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>
      <div className="flex-1 mr-56 px-6 py-8">
        {children}
      </div>
      <NewUserAlert />
    </div>
  )
}

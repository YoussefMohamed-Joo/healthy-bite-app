import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Login from '@/pages/Login'
import Products from '@/pages/Products'
import Orders from '@/pages/Orders'

function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-100 h-14 flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-extrabold text-sm">H</div>
              <span className="font-cairo font-bold text-zinc-900">Admin</span>
            </div>
            <nav className="flex gap-4">
              <a href="/" className="text-sm font-semibold text-brand">المنتجات</a>
              <a href="/orders" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900">الطلبات</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">{user?.email}</span>
            <button onClick={logout} className="text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer">تسجيل خروج</button>
          </div>
        </div>
      </header>
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}

function AdminRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuth } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<AdminRoute><AdminLayout><Products /></AdminLayout></AdminRoute>} />
      <Route path="/orders" element={<AdminRoute><AdminLayout><Orders /></AdminLayout></AdminRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

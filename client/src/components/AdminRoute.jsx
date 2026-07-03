import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-400 text-sm">جاري التحميل...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return children
}

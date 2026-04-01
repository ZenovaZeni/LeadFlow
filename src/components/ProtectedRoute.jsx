import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  const bypassAuth = false // Enforce real Supabase redirects

  if (loading) {
    return <div className="loading-fallback">Loading session...</div>
  }

  if (!user && !bypassAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}

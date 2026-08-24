import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../lib/constants'

/**
 * Blocks anonymous visitors, and sends a signed-in user who wanders into
 * another role's screen back to their own home instead of showing a 403.
 */
export default function ProtectedRoute({ allow, children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
  }

  return children
}

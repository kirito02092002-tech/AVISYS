import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'
import { getPostLoginRoute } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  allowIncomplete?: boolean
  allowPending?: boolean
}

export function ProtectedRoute({
  allowedRoles,
  allowIncomplete,
  allowPending,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (profile.status === 'suspended') {
    return <Navigate to="/login" replace state={{ error: 'Compte suspendu' }} />
  }

  if (profile.status === 'incomplete') {
    if (allowIncomplete) return <Outlet />
    if (location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />
    }
    return <Outlet />
  }

  if (profile.status === 'pending') {
    if (allowPending) return <Outlet />
    if (location.pathname !== '/pending-approval') {
      return <Navigate to="/pending-approval" replace />
    }
    return <Outlet />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getPostLoginRoute(profile)} replace />
  }

  return <Outlet />
}

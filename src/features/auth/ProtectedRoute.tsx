import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

export function ProtectedRoute({
  children,
  role,
}: PropsWithChildren<{ role?: 'student' | 'parent' }>) {
  const { session, profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#f7f7fc]">
        <img
          src="/img/lumi/face.png"
          alt="Lumi cargando"
          className="h-24 w-24 animate-pulse object-contain"
        />
      </div>
    )
  }

  if (!session) return <Navigate to="/acceso" replace />
  if (!profile) return <Navigate to="/acceso" replace />
  if (role && profile.role !== role) {
    return (
      <Navigate
        to={profile.role === 'parent' ? '/reporte-padres' : '/'}
        replace
      />
    )
  }

  return children
}

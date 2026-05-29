import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { Loading } from './Loading'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'

export function useAuth() {
  const { user, setUser } = useAuthStore()

  const query = useQuery({
    queryKey: ['me'],
    queryFn: usersApi.getMe,
    retry: false,
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    if (query.data) setUser(query.data)
    if (query.isError) setUser(null)
  }, [query.data, query.isError, setUser])

  return {
    user: query.data ?? user,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    isError: query.isError,
  }
}
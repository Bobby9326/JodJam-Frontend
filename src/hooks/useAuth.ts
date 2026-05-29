import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'
import api from '@/lib/axios'

// Axios interceptor: auto refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      try {
        await authApi.refresh()
        return api(err.config)
      } catch {
        // refresh failed — redirect to login
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

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

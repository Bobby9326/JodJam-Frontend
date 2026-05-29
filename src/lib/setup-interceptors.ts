import api from '@/lib/axios'
import { authApi } from '@/api/auth.api'

export function setupInterceptors() {
  api.interceptors.response.use(
    res => res,

    async err => {
      const originalRequest = err.config

      // ✅ กัน refresh loop
      if (
        originalRequest.url?.includes('refresh')
      ) {
        window.location.href = '/login'

        return Promise.reject(err)
      }

      if (
        err.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true

        try {
          await authApi.refresh()

          return api(originalRequest)
        } catch {
          window.location.href = '/login'
        }
      }

      return Promise.reject(err)
    }
  )
}
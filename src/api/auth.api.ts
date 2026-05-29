import api from '@/lib/axios'

export const authApi = {
  loginGoogle: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/login/google`
  },
  logout: () => api.post('/logout'),
  refresh: () => api.post('/refresh'),
}

import api from '@/lib/axios'
import type { User } from '@/types/auth.types'

export const usersApi = {
  getMe: () => api.get<User>('/users/me').then(r => r.data),
  updateMe: (data: { username?: string; bio?: string; profile_url?: string }) =>
    api.patch<User>('/users/me', data).then(r => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ path: string }>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}

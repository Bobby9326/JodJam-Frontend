import api from '@/lib/axios'
import type { CalendarResponse, MemoryDetailResponse } from '@/types/entry.types'
import type { Mood } from '@/types/entry.types'

export const entriesApi = {
  getCalendar: (year: number) =>
    api.get<CalendarResponse>(`/memories/calendar?year=${year}`).then(r => r.data),

  getMemoryDetail: (date: string) =>
    api.get<MemoryDetailResponse>(`/memories/${date}`).then(r => r.data),

  createMemory: (data: { note: string; mood: Mood; rating: number; file: File }) => {
    const form = new FormData()
    form.append('file', data.file)
    form.append('note', data.note)
    form.append('mood', data.mood)
    form.append('rating', String(data.rating))
    return api.post('/memories', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}

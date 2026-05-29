import { useQuery } from '@tanstack/react-query'
import { entriesApi } from '@/api/entries.api'

export function useCalendar(year: number) {
  return useQuery({
    queryKey: ['calendar', year],
    queryFn: () => entriesApi.getCalendar(year),
  })
}

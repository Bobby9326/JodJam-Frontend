import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { entriesApi } from '@/api/entries.api'
import type { Mood } from '@/types/entry.types'

export function useMemoryDetail(date: string) {
  return useQuery({
    queryKey: ['memory', date],
    queryFn: () => entriesApi.getMemoryDetail(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateMemory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { note: string; mood: Mood; rating: number; file: File }) =>
      entriesApi.createMemory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

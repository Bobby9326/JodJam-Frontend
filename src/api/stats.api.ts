import api from '@/lib/axios'
import type { StatsOverview, StatsMood, YearlyAverage, YearlyMood } from '@/types/api.types'

export const statsApi = {
  getOverview: (year: number) =>
    api.get<StatsOverview>(`/stats/overview?year=${year}`).then(r => r.data),
  getMood: (year: number) =>
    api.get<StatsMood>(`/stats/mood?year=${year}`).then(r => r.data),
  getYearlyAverage: (year: number) =>
    api.get<YearlyAverage>(`/stats/yearly-average?year=${year}`).then(r => r.data),
  getYearlyMood: (year: number) =>
    api.get<YearlyMood>(`/stats/yearly-mood?year=${year}`).then(r => r.data),
}

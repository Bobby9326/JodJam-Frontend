export interface StatsOverview {
  current_streak: number
  longest_streak: number
  average_rating: number
  record_day: number
  record_rating: number
}

export interface StatsMood {
  mood: string
  count: number
  percentage: number
  most_weekday: string
  amount: number
}

export interface YearlyAverage {
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
}

export interface MoodStat {
  count: number
  percentage: number
}

export interface YearlyMood {
  happy: MoodStat
  sad: MoodStat
  tired: MoodStat
  stressed: MoodStat
  excited: MoodStat
  angry: MoodStat
  bored: MoodStat
  lonely: MoodStat
}

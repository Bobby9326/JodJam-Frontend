export type Mood = 'happy' | 'sad' | 'tired' | 'stressed' | 'excited' | 'angry' | 'bored' | 'lonely'

export interface DayEntry {
  date: string
  has_entry: boolean
  img_url: string | null
}

export interface CalendarResponse {
  january: DayEntry[]; february: DayEntry[]; march: DayEntry[]
  april: DayEntry[];   may: DayEntry[];      june: DayEntry[]
  july: DayEntry[];    august: DayEntry[];   september: DayEntry[]
  october: DayEntry[]; november: DayEntry[]; december: DayEntry[]
}

export interface MemoryDetail {
  memory_date: string
  note: string
  mood: Mood
  rating: number
  img_url: string | null
}

export interface MemoryDetailResponse {
  before: DayEntry[]
  after: DayEntry[]
  data: MemoryDetail | null
}

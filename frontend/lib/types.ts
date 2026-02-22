// API response from /diary or /diary/{delta}
export interface ApiAssignment {
  id: number
  comment: string
  type: string
  content: string
  mark: number | null
  is_duty: boolean
  deadline: string
}

export interface ApiLesson {
  day: string        // "2026-02-09"
  start: string      // "08:15:00"
  end: string        // "08:45:00"
  room: string
  number: number
  subject: string
  assignments: ApiAssignment[]
}

export interface ApiDiaryResponse {
  start: string      // "2026-02-09"
  end: string        // "2026-02-15"
  schedule: {
    lessons: ApiLesson[]
  }[]
}

// API response from /homework/{assignment_id}
export interface ApiHomeworkDetails {
  id: number
  weight: number
  description: string
  attachments: {
    name?: string
    url: string
  }[]
}

// Transformed types for UI
export interface DaySchedule {
  dayName: string       // "Понедельник"
  dayShort: string      // "Пн"
  date: string          // "09.02"
  isoDate: string       // "2026-02-09"
  lessons: ApiLesson[]
}

export interface WeekData {
  start: string
  end: string
  days: DaySchedule[]
}

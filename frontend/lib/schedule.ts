import type { ApiDiaryResponse, ApiLesson, DaySchedule, WeekData } from "./types"

const DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
const DAY_SHORTS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}.${m}`
}

function formatDateFull(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

export function transformDiaryResponse(data: ApiDiaryResponse): WeekData {
  // Collect all lessons from all schedule entries
  const allLessons: ApiLesson[] = []
  for (const entry of data.schedule) {
    allLessons.push(...entry.lessons)
  }

  // Group lessons by day
  const byDay = new Map<string, ApiLesson[]>()
  for (const lesson of allLessons) {
    const existing = byDay.get(lesson.day) || []
    existing.push(lesson)
    byDay.set(lesson.day, existing)
  }

  // Sort days and create DaySchedule objects
  const sortedDays = Array.from(byDay.keys()).sort()

  const days: DaySchedule[] = sortedDays.map((isoDate) => {
    const date = new Date(isoDate + "T00:00:00")
    const dayOfWeek = date.getDay()
    const lessons = byDay.get(isoDate) || []
    // Sort lessons by number
    lessons.sort((a, b) => a.number - b.number)

    return {
      dayName: DAY_NAMES[dayOfWeek],
      dayShort: DAY_SHORTS[dayOfWeek],
      date: formatDateShort(isoDate),
      isoDate,
      lessons,
    }
  })

  return {
    start: formatDateFull(data.start),
    end: formatDateFull(data.end),
    days,
  }
}

export function getTodayDayIndex(days: DaySchedule[]): number {
  const today = new Date().toISOString().slice(0, 10)
  const idx = days.findIndex((d) => d.isoDate === today)
  return idx >= 0 ? idx : 0
}

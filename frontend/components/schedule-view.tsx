"use client"

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import { CalendarDays, BookOpenCheck, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { DayTabs } from "@/components/day-tabs"
import { LessonCard } from "@/components/lesson-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { transformDiaryResponse, getTodayDayIndex } from "@/lib/schedule"
import type { ApiDiaryResponse } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("Ошибка загрузки")
  return r.json()
})

export function ScheduleView() {
  const [delta, setDelta] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [initialDaySet, setInitialDaySet] = useState(false)

  const { data: rawData, error, isLoading, mutate } = useSWR<ApiDiaryResponse>(
    delta === 0 ? "/api/diary" : `/api/diary?delta=${delta}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const weekData = rawData ? transformDiaryResponse(rawData) : null

  // Set active day to today on first load of current week
  useEffect(() => {
    if (weekData && !initialDaySet) {
      setActiveDay(getTodayDayIndex(weekData.days))
      setInitialDaySet(true)
    }
  }, [weekData, initialDaySet])

  // Reset active day when switching weeks
  useEffect(() => {
    if (delta !== 0) {
      setActiveDay(0)
    } else {
      // Re-detect today when going back to current week
      setInitialDaySet(false)
    }
    setExpandedLessons(new Set())
  }, [delta])

  const goToPrevWeek = useCallback(() => {
    setDelta((prev) => prev - 1)
  }, [])

  const goToNextWeek = useCallback(() => {
    setDelta((prev) => prev + 1)
  }, [])

  const goToCurrentWeek = useCallback(() => {
    setDelta(0)
  }, [])

  const handleDayChange = useCallback((index: number) => {
    setActiveDay(index)
    setExpandedLessons(new Set())
  }, [])

  const toggleLesson = useCallback((key: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const currentDay = weekData?.days[activeDay]

  const homeworkAssignments = currentDay
    ? currentDay.lessons.flatMap((l) =>
        l.assignments
          .filter((a) => a.type === "Домашнее задание" && a.content !== "не задано")
          .map((a) => `${l.day}-${l.number}`)
      )
    : []

  const homeworkCount = new Set(homeworkAssignments).size

  const showAllHomework = useCallback(() => {
    if (!currentDay) return
    const keys = currentDay.lessons
      .filter((l) =>
        l.assignments.some((a) => a.type === "Домашнее задание" && a.content !== "не задано")
      )
      .map((l) => `${l.day}-${l.number}`)

    setExpandedLessons((prev) => {
      const allExpanded = keys.every((k) => prev.has(k))
      if (allExpanded) return new Set()
      return new Set(keys)
    })
  }, [currentDay])

  const allHomeworkExpanded =
    homeworkCount > 0 &&
    currentDay !== undefined &&
    currentDay.lessons
      .filter((l) =>
        l.assignments.some((a) => a.type === "Домашнее задание" && a.content !== "не задано")
      )
      .every((l) => expandedLessons.has(`${l.day}-${l.number}`))

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
              Расписание уроков
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground text-sm mt-2 ml-[3.25rem]">
          Расписание на неделю и домашние задания
        </p>
      </header>

      {/* Week navigation */}
      <div className="mb-5 flex items-center justify-between rounded-xl border bg-card p-3">
        <button
          onClick={goToPrevWeek}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Предыдущая неделя"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : weekData ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                {weekData.start} — {weekData.end}
              </p>
              {delta !== 0 && (
                <button
                  onClick={goToCurrentWeek}
                  className="text-xs text-primary hover:underline mt-0.5"
                >
                  Текущая неделя
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">---</p>
          )}
        </div>
        <button
          onClick={goToNextWeek}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Следующая неделя"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Загрузка расписания...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Не удалось загрузить расписание</p>
            <p className="text-xs text-muted-foreground mt-1">Проверьте подключение к API</p>
          </div>
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Повторить
          </button>
        </div>
      )}

      {/* Schedule content */}
      {weekData && !isLoading && weekData.days.length > 0 && (
        <>
          {/* Day tabs */}
          <div className="mb-6">
            <DayTabs days={weekData.days} activeDay={activeDay} onDayChange={handleDayChange} />
          </div>

          {currentDay && (
            <>
              {/* Day header with homework toggle */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {currentDay.dayName}, {currentDay.date}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentDay.lessons.length}{" "}
                    {currentDay.lessons.length === 1
                      ? "урок"
                      : currentDay.lessons.length < 5
                        ? "урока"
                        : "уроков"}
                  </p>
                </div>
                {homeworkCount > 0 && (
                  <button
                    onClick={showAllHomework}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    {allHomeworkExpanded ? "Скрыть ДЗ" : "Все ДЗ"}
                    <span className="ml-0.5 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold">
                      {homeworkCount}
                    </span>
                  </button>
                )}
              </div>

              {/* Lessons list */}
              <div className="flex flex-col gap-3" role="list" aria-label={`Уроки на ${currentDay.dayName}`}>
                {currentDay.lessons.map((lesson) => {
                  const key = `${lesson.day}-${lesson.number}`
                  return (
                    <LessonCard
                      key={key}
                      lesson={lesson}
                      isExpanded={expandedLessons.has(key)}
                      onToggle={() => toggleLesson(key)}
                    />
                  )
                })}
              </div>

              {/* Footer hint */}
              <p className="mt-6 text-center text-xs text-muted-foreground/60">
                Нажмите на урок, чтобы увидеть задания
              </p>
            </>
          )}
        </>
      )}

      {/* Empty state */}
      {weekData && !isLoading && weekData.days.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <CalendarDays className="h-10 w-10 opacity-30" />
          <p className="text-sm">Нет уроков на этой неделе</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Clock,
  BookOpen,
  ChevronDown,
  Loader2,
  FileText,
  Paperclip,
  Star,
  AlertCircle,
  WeightTilde
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApiLesson, ApiAssignment, ApiHomeworkDetails } from "@/lib/types"

interface LessonCardProps {
  lesson: ApiLesson
  isExpanded: boolean
  onToggle: () => void
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Ошибка загрузки")
    return r.json()
  })

function AssignmentBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    "Домашнее задание": "bg-primary/10 text-primary",
    "Контрольная работа": "bg-destructive/10 text-destructive",
    "Ответ на уроке": "bg-accent/10 text-accent-foreground",
    "Устная работа": "bg-secondary text-secondary-foreground",
    "Лексическое упражнение": "bg-secondary text-secondary-foreground",
    "Работа с текстом": "bg-secondary text-secondary-foreground",
  }
  const cls = colors[type] || "bg-secondary text-secondary-foreground"
  return (
    <span className={cn("inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold", cls)}>
      {type}
    </span>
  )
}

function MarkBadge({ mark }: { mark: number }) {
  const color =
    mark === 5
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : mark === 4
        ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
        : mark === 3
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          : "bg-red-500/15 text-red-600 dark:text-red-400"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold", color)}>
      <Star className="h-3 w-3" />
      {mark}
    </span>
  )
}

function WeightBadge({ weight }: { weight: number }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400")}>
      <WeightTilde className="h-3 w-3" />
      {weight}
    </span>
  )
}

function DetailPanel({ assignment, shouldFetch, data, error, isLoading }) {
  if (isLoading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Загрузка подробностей...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-destructive/70">
        <AlertCircle className="h-3 w-3" />
        <span>Не удалось загрузить</span>
      </div>
    )
  }

  if (!data) return null

  const hasDescription = data.description && data.description !== assignment.content
  const hasAttachments = data.attachments && data.attachments.length > 0
  const hasComment = assignment.comment && assignment.comment.length > 0

  if (!hasDescription && !hasAttachments && !hasComment) return null

  return (
    <div className="mt-2 flex flex-col gap-2">
      {hasComment && (
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Комментарий</p>
          <p className="text-sm leading-relaxed text-card-foreground">{assignment.comment}</p>
        </div>
      )}
      {hasDescription && (
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Подробности</p>
          <p className="text-sm leading-relaxed text-card-foreground">{data.description}</p>
        </div>
      )}
      {hasAttachments && (
        <div className="rounded-md border border-border px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            Файлы ({data.attachments.length})
          </p>
          <div className="flex flex-col gap-1">
            {data.attachments.map((file, i) => (
              <a
                key={i}
                href={`/api/file/${file.id}`}
                download
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary/70"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate text-card-foreground hover:text-primary transition-colors">
                  {file.name || `Файл ${i + 1}`}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function HomeworkItem({a, i}) {
  const shouldFetch = a.id > 0
  const { data, error, isLoading } = useSWR<ApiHomeworkDetails>(
    shouldFetch ? `/api/homework/${a.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  return (
    <div key={`hw-${i}`}>
      <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 p-3">
        <BookOpen className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AssignmentBadge type={a.type} />
            {a.mark !== null && <MarkBadge mark={a.mark} />}
            <WeightBadge weight={a.weight} />
          </div>
          <p className="text-sm leading-relaxed text-card-foreground">{a.content}</p>
          <DetailPanel assignment={a} shouldFetch={shouldFetch} data={data} error={error} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export function OtherItem({a, i}) {
  const shouldFetch = a.id > 0
  const { data, error, isLoading } = useSWR<ApiHomeworkDetails>(
    shouldFetch ? `/api/homework/${a.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  return (
    <div key={`other-${i}`} className="flex items-start gap-2.5 rounded-lg bg-secondary/40 p-3">
      <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <AssignmentBadge type={a.type} />
          {a.mark !== null && <MarkBadge mark={a.mark} />}
          <WeightBadge weight={a.weight} />
        </div>
        <p className="text-sm leading-relaxed text-card-foreground">{a.content}</p>
        <DetailPanel assignment={a} shouldFetch={shouldFetch} data={data} error={error} isLoading={isLoading} />
      </div>
    </div>
  )
}

export function LessonCard({ lesson, isExpanded, onToggle }: LessonCardProps) {
  const hasHomework = lesson.assignments.some(
    (a) => a.type === "Домашнее задание" && a.content !== "не задано"
  )
  const hasAnyAssignment = lesson.assignments.length > 0

  const timeStart = lesson.start.slice(0, 5)
  const timeEnd = lesson.end.slice(0, 5)

  // Separate homework from other assignments
  const homeworkAssignments = lesson.assignments.filter(
    (a) => a.type === "Домашнее задание" && a.content !== "не задано"
  )
  const otherAssignments = lesson.assignments.filter(
    (a) => !(a.type === "Домашнее задание" && a.content === "не задано")
  ).filter((a) => a.type !== "Домашнее задание")

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300",
        "hover:shadow-md hover:border-primary/20",
        isExpanded && "shadow-md border-primary/30"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        aria-expanded={isExpanded}
        aria-controls={`assignments-${lesson.day}-${lesson.number}`}
        disabled={!hasAnyAssignment}
      >
        {/* Lesson number */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
          {lesson.number}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-card-foreground text-base leading-tight">
              {lesson.subject}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Show marks inline */}
              {lesson.assignments
                .filter((a) => a.mark !== null)
                .map((a, i) => (
                  <MarkBadge key={i} mark={a.mark!} />
                ))}
              {hasAnyAssignment && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200 mt-0.5",
                    isExpanded && "rotate-180 text-primary"
                  )}
                />
              )}
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {timeStart} – {timeEnd}
            </span>
          </div>
        </div>
      </button>

      {/* Expandable assignments section */}
      <div
        id={`assignments-${lesson.day}-${lesson.number}`}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        role="region"
        aria-label={`Задания по ${lesson.subject}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-dashed border-border px-4 pb-4 pt-3 flex flex-col gap-2.5">
            {/* Homework assignments */}
            {homeworkAssignments.map((a, i) => (<HomeworkItem key={a.id ?? i} a={a} i={i} />))}

            {/* Other assignments */}
            {otherAssignments.map((a, i) => (<OtherItem key={a.id ?? i} a={a} i={i}/>))}
          </div>
        </div>
      </div>

      {/* Homework indicator */}
      {hasHomework && !isExpanded && (
        <div className="absolute right-4 bottom-3">
          <span className="inline-flex items-center gap-1 text-xs text-primary/70">
            <BookOpen className="h-3 w-3" />
            <span className="sr-only">Есть домашнее задание</span>
          </span>
        </div>
      )}
    </article>
  )
}

"use client"

import { cn } from "@/lib/utils"
import type { DaySchedule } from "@/lib/types"

interface DayTabsProps {
  days: DaySchedule[]
  activeDay: number
  onDayChange: (index: number) => void
}

export function DayTabs({ days, activeDay, onDayChange }: DayTabsProps) {
  return (
    <nav aria-label="Дни недели" className="flex gap-1 rounded-xl bg-secondary/60 p-1.5">
      {days.map((day, index) => (
        <button
          key={day.isoDate}
          onClick={() => onDayChange(index)}
          className={cn(
            "relative flex-1 flex flex-col items-center rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            activeDay === index
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          )}
          aria-current={activeDay === index ? "true" : undefined}
        >
          <span className="hidden sm:inline text-sm">{day.dayName}</span>
          <span className="sm:hidden text-sm">{day.dayShort}</span>
          <span
            className={cn(
              "text-[10px] mt-0.5",
              activeDay === index ? "text-primary-foreground/70" : "text-muted-foreground/60"
            )}
          >
            {day.date}
          </span>
        </button>
      ))}
    </nav>
  )
}

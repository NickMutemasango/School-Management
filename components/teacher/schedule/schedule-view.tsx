"use client";

import * as React from "react";
import { CalendarDays, LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";
import { TimetableGrid } from "./timetable-grid";
import { ScheduleDayList } from "./schedule-day-list";
import {
  WEEKDAYS,
  lessonsPerDay,
  REFERENCE_WEEKDAY,
  type Weekday,
} from "@/lib/data/teacher-schedule";

type ViewMode = "week" | "day";

export function ScheduleView() {
  const [view, setView] = React.useState<ViewMode>("week");
  const [day, setDay] = React.useState<Weekday>(REFERENCE_WEEKDAY);

  const perDay = React.useMemo(() => lessonsPerDay(), []);
  const totalLessons = React.useMemo(
    () => Object.values(perDay).reduce((a, b) => a + b, 0),
    [perDay]
  );

  return (
    <div className="space-y-5">
      {/* Load summary */}
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className="bg-background rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lessons per week
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{totalLessons}</p>
        </div>

        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={cn(
              "rounded-2xl border p-4 shadow-sm transition-colors",
              d === REFERENCE_WEEKDAY
                ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
                : "bg-background border-slate-200 dark:border-slate-800"
            )}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {d.slice(0, 3)}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{perDay[d]}</p>
          </div>
        ))}
      </div>

      {/* View controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Schedule view"
          className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          <ViewButton
            active={view === "week"}
            onClick={() => setView("week")}
            icon={LayoutGrid}
            label="Week"
          />
          <ViewButton
            active={view === "day"}
            onClick={() => setView("day")}
            icon={CalendarDays}
            label="Day"
          />
        </div>

        {view === "day" && (
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                aria-pressed={day === d}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  day === d
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60"
                )}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "week" ? (
        <TimetableGrid highlightDay={REFERENCE_WEEKDAY} />
      ) : (
        <ScheduleDayList day={day} />
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {view === "week"
          ? "Scroll horizontally on narrow screens. Select a lesson to open its class."
          : `${perDay[day]} lesson${perDay[day] === 1 ? "" : "s"} on ${day}.`}
      </p>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-slate-900 shadow-sm dark:text-slate-100"
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

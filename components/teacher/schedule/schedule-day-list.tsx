"use client";

import { CalendarDays, MapPin } from "lucide-react";

import { cn, avatarColorFor } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import {
  entriesForDay,
  periodById,
  type TimetableEntry,
  type Weekday,
} from "@/lib/data/teacher-schedule";

interface ScheduleDayListProps {
  entries: TimetableEntry[];
  day: Weekday;
}

export function ScheduleDayList({ entries: allEntries, day }: ScheduleDayListProps) {
  const entries = entriesForDay(allEntries, day);

  if (entries.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={CalendarDays}
          title="No lessons scheduled"
          description={`${day} is clear on your timetable.`}
        />
      </div>
    );
  }

  return (
    <div className="bg-background overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {entries.map((entry) => {
          const period = periodById(entry.periodId);
          return (
            <li key={entry.id}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-[52px] shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {period?.startTime}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {period?.endTime}
                  </p>
                </div>

                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold",
                    avatarColorFor(entry.className)
                  )}
                >
                  {entry.className.replace(/[^0-9A-Z]/g, "").slice(0, 3)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.subject}
                    <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                      {entry.className}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="size-3 shrink-0" />
                    {entry.room}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

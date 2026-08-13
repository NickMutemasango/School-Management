import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import type { ScheduleSlot, SlotStatus } from "@/lib/data/teacher";

const STATUS_STYLES: Record<SlotStatus, { dot: string; row: string; label?: string }> =
  {
    done: { dot: "bg-slate-300 dark:bg-slate-600", row: "opacity-60" },
    current: {
      dot: "bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950",
      row: "bg-blue-50/50 dark:bg-blue-950/20",
      label: "Now",
    },
    upcoming: { dot: "bg-slate-400 dark:bg-slate-500", row: "" },
  };

export function TodaysSchedule({ slots }: { slots: ScheduleSlot[] }) {
  return (
    <section className="bg-background rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="size-[18px] text-slate-400" />
          <h2 className="font-bold tracking-tight">Today&rsquo;s Schedule</h2>
        </div>
        <Link
          href="/teacher/schedule"
          className="rounded text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:text-blue-400"
        >
          Full timetable
        </Link>
      </header>

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No lessons scheduled"
          description="Your timetable is clear for today."
        />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {slots.map((slot) => {
            const style = STATUS_STYLES[slot.status];
            return (
              <li
                key={slot.id}
                className={cn("flex items-center gap-4 px-5 py-3.5", style.row)}
              >
                <div className="w-[52px] shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {slot.startTime}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {slot.endTime}
                  </p>
                </div>

                <span
                  aria-hidden
                  className={cn("size-2.5 shrink-0 rounded-full", style.dot)}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {slot.subject}
                    <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                      {slot.className}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="size-3 shrink-0" />
                    {slot.room}
                  </p>
                </div>

                {style.label && (
                  <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                    {style.label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

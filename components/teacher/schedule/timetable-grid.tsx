"use client";

import { cn } from "@/lib/utils";
import { classDefinitions } from "@/lib/data/teacher-classes";
import {
  WEEKDAYS,
  classNameFor,
  entryAt,
  periods,
  type Weekday,
} from "@/lib/data/teacher-schedule";

/** Class id -> tile tone, reusing each class's colour from the registry. */
const TONE_BY_CLASS: Record<string, string> = Object.fromEntries(
  classDefinitions.map((c) => [c.id, c.tone])
);

export function TimetableGrid({ highlightDay }: { highlightDay: Weekday }) {
  return (
    <div className="bg-background overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Weekly teaching timetable by period and weekday
          </caption>

          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th
                scope="col"
                className="bg-background sticky left-0 z-10 w-[92px] px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                Period
              </th>
              {WEEKDAYS.map((day) => (
                <th
                  key={day}
                  scope="col"
                  className={cn(
                    "min-w-[150px] px-3 py-3 text-center text-xs font-semibold",
                    day === highlightDay
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300"
                  )}
                >
                  {day}
                  {day === highlightDay && (
                    <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      TODAY
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {periods.map((period) =>
              period.isBreak ? (
                <tr key={period.id} className="bg-slate-50 dark:bg-slate-800/40">
                  <th
                    scope="row"
                    className="bg-slate-50 sticky left-0 z-10 px-4 py-2 text-left text-[11px] font-medium text-slate-400 dark:bg-slate-800/40"
                  >
                    {period.startTime}
                  </th>
                  <td
                    colSpan={WEEKDAYS.length}
                    className="px-3 py-2 text-center text-[11px] font-medium tracking-wide text-slate-400 uppercase"
                  >
                    {period.label}
                  </td>
                </tr>
              ) : (
                <tr
                  key={period.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <th
                    scope="row"
                    className="bg-background sticky left-0 z-10 px-4 py-2 text-left align-middle font-normal"
                  >
                    <span className="block text-xs font-semibold tabular-nums">
                      {period.startTime}
                    </span>
                    <span className="block text-[11px] text-slate-400 tabular-nums">
                      {period.endTime}
                    </span>
                  </th>

                  {WEEKDAYS.map((day) => {
                    const entry = entryAt(day, period.id);
                    const isToday = day === highlightDay;

                    return (
                      <td
                        key={day}
                        className={cn(
                          "p-1.5 align-top",
                          isToday && "bg-blue-50/40 dark:bg-blue-950/10"
                        )}
                      >
                        {entry ? (
                          <div
                            className={cn(
                              "rounded-lg p-2.5",
                              TONE_BY_CLASS[entry.classId] ??
                                "bg-slate-100 text-slate-700"
                            )}
                          >
                            <span className="block truncate text-xs font-bold">
                              {classNameFor(entry)}
                            </span>
                            <span className="block truncate text-[11px] opacity-80">
                              {entry.subject}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] opacity-70">
                              {entry.room}
                            </span>
                          </div>
                        ) : (
                          <div className="grid h-[62px] place-items-center rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-300 dark:border-slate-800 dark:text-slate-600">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Weekly timetable data contract.
 *
 * The bell schedule (periods, breaks) and weekday list are configuration and
 * stay populated here. `TimetableEntry` records come from a real query
 * (`lib/teacher/timetable.ts`) - these helpers take them as an explicit
 * argument rather than closing over a module constant, since the data is
 * now per-request and per-teacher rather than a single frozen array.
 */

export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export const WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export interface Period {
  id: string;
  startTime: string;
  endTime: string;
  /** Breaks render as full-width dividers rather than teachable slots. */
  isBreak?: boolean;
  label?: string;
}

/** The school's bell schedule - configuration, not sample data. */
export const periods: Period[] = [
  { id: "p1", startTime: "07:30", endTime: "08:10" },
  { id: "p2", startTime: "08:15", endTime: "08:55" },
  { id: "b1", startTime: "08:55", endTime: "09:20", isBreak: true, label: "Short break" },
  { id: "p3", startTime: "09:20", endTime: "10:00" },
  { id: "p4", startTime: "10:05", endTime: "10:45" },
  { id: "b2", startTime: "10:45", endTime: "11:30", isBreak: true, label: "Lunch" },
  { id: "p5", startTime: "11:30", endTime: "12:10" },
  { id: "p6", startTime: "12:15", endTime: "12:55" },
  { id: "p7", startTime: "13:00", endTime: "13:40" },
];

export const teachingPeriods = periods.filter((p) => !p.isBreak);

export interface TimetableEntry {
  id: string;
  day: Weekday;
  periodId: string;
  className: string;
  subject: string;
  room: string;
}

/** Entry occupying a given day/period, if any. */
export function entryAt(entries: TimetableEntry[], day: Weekday, periodId: string) {
  return entries.find((e) => e.day === day && e.periodId === periodId);
}

export function periodById(periodId: string) {
  return periods.find((p) => p.id === periodId);
}

export function entriesForDay(entries: TimetableEntry[], day: Weekday) {
  return entries
    .filter((e) => e.day === day)
    .sort((a, b) => {
      const pa = periodById(a.periodId)?.startTime ?? "";
      const pb = periodById(b.periodId)?.startTime ?? "";
      return pa.localeCompare(pb);
    });
}

/** Teaching load per weekday, for the summary strip. */
export function lessonsPerDay(entries: TimetableEntry[]): Record<Weekday, number> {
  return Object.fromEntries(
    WEEKDAYS.map((d) => [d, entries.filter((e) => e.day === d).length])
  ) as Record<Weekday, number>;
}

/** Today's name, or null on a weekend (the timetable has no Sat/Sun columns). */
export function todayWeekday(): Weekday | null {
  const name = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return (WEEKDAYS as string[]).includes(name) ? (name as Weekday) : null;
}

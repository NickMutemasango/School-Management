/**
 * Teacher portal dashboard types + derivations.
 *
 * `todaysSchedule`/`teacherStats` consts are only the signed-out fallback
 * middleware already guards against - every signed-in teacher gets these
 * derived from real data via `deriveTodaysSchedule` below.
 */

import { entriesForDay, periodById, todayWeekday, type TimetableEntry } from "./teacher-schedule";

export type SlotStatus = "done" | "current" | "upcoming";

export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  className: string;
  subject: string;
  room: string;
  status: SlotStatus;
}

function slotStatus(startTime: string, endTime: string, nowTime: string): SlotStatus {
  if (nowTime >= endTime) return "done";
  if (nowTime >= startTime) return "current";
  return "upcoming";
}

/** Today's lessons from a teacher's real timetable, banded against the current time. */
export function deriveTodaysSchedule(entries: TimetableEntry[]): ScheduleSlot[] {
  const today = todayWeekday();
  if (!today) return [];

  const nowTime = new Date().toTimeString().slice(0, 5);

  return entriesForDay(entries, today).map((entry) => {
    const period = periodById(entry.periodId);
    const startTime = period?.startTime ?? "";
    const endTime = period?.endTime ?? "";

    return {
      id: entry.id,
      startTime,
      endTime,
      className: entry.className,
      subject: entry.subject,
      room: entry.room,
      status: slotStatus(startTime, endTime, nowTime),
    };
  });
}

export const todaysSchedule: ScheduleSlot[] = [];

export interface TeacherStats {
  lessonsToday: number;
  lessonsThisWeek: number;
  classesTaught: number;
  subjectsTaught: number;
}

export const teacherStats: TeacherStats = {
  lessonsToday: 0,
  lessonsThisWeek: 0,
  classesTaught: 0,
  subjectsTaught: 0,
};

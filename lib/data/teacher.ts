/**
 * Teacher portal mock data.
 *
 * Scope is the dashboard, the weekly timetable, and profile settings.
 * Structured to mirror a real API response so each export can be swapped for
 * a query later without touching the components. Types are the contract.
 */

import { classNameById } from "./teacher-classes";
import {
  entriesForDay,
  periodById,
  timetable,
  REFERENCE_TIME,
  REFERENCE_WEEKDAY,
} from "./teacher-schedule";

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  staffNumber: string;
  role: string;
  department: string;
  subjects: string[];
}

/**
 * Signed-in teacher. Empty until an auth provider is wired up - the sidebar
 * and greeting fall back to a signed-out state.
 */
export const teacherProfile: TeacherProfile = {
  id: "",
  name: "",
  email: "",
  staffNumber: "",
  role: "",
  department: "",
  subjects: [],
};

/* -------------------------------------------------------------------------- */
/* Today's schedule                                                            */
/* -------------------------------------------------------------------------- */

export type SlotStatus = "done" | "current" | "upcoming";

export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  subject: string;
  room: string;
  status: SlotStatus;
}

/** Band a slot against the fixed reference time. */
function slotStatus(startTime: string, endTime: string): SlotStatus {
  if (REFERENCE_TIME >= endTime) return "done";
  if (REFERENCE_TIME >= startTime) return "current";
  return "upcoming";
}

/**
 * Derived from the weekly timetable rather than maintained separately, so the
 * dashboard and the schedule page always show the same lessons.
 */
export const todaysSchedule: ScheduleSlot[] = entriesForDay(
  REFERENCE_WEEKDAY
).map((entry) => {
  const period = periodById(entry.periodId);
  const startTime = period?.startTime ?? "";
  const endTime = period?.endTime ?? "";

  return {
    id: entry.id,
    startTime,
    endTime,
    classId: entry.classId,
    className: classNameById[entry.classId] ?? entry.classId,
    subject: entry.subject,
    room: entry.room,
    status: slotStatus(startTime, endTime),
  };
});

/* -------------------------------------------------------------------------- */
/* Dashboard KPIs                                                              */
/* -------------------------------------------------------------------------- */

export interface TeacherStats {
  lessonsToday: number;
  lessonsThisWeek: number;
  classesTaught: number;
  subjectsTaught: number;
}

/** All derived from the timetable so the figures can never drift from it. */
export const teacherStats: TeacherStats = {
  lessonsToday: todaysSchedule.length,
  lessonsThisWeek: timetable.length,
  classesTaught: new Set(timetable.map((e) => e.classId)).size,
  subjectsTaught: new Set(timetable.map((e) => e.subject)).size,
};

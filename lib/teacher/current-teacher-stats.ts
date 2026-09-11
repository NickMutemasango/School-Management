import { createClient } from "@/lib/supabase/server";
import type { TeacherStats } from "@/lib/data/teacher";
import { todayWeekday, type TimetableEntry } from "@/lib/data/teacher-schedule";

/**
 * classesTaught/subjectsTaught are computed from class_teacher_subjects for
 * the signed-in teacher; lessonsToday/lessonsThisWeek come from their real
 * timetable entries, passed in rather than re-queried since the caller
 * already fetches them for the dashboard's schedule list.
 */
export async function getCurrentTeacherStats(
  teacherId: string,
  entries: TimetableEntry[]
): Promise<TeacherStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_teacher_subjects")
    .select("class_id, subject")
    .eq("teacher_id", teacherId);

  const rows = data ?? [];
  const today = todayWeekday();

  return {
    lessonsToday: today ? entries.filter((e) => e.day === today).length : 0,
    lessonsThisWeek: entries.length,
    classesTaught: new Set(rows.map((r) => r.class_id)).size,
    subjectsTaught: new Set(rows.map((r) => r.subject)).size,
  };
}

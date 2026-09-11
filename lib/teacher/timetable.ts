import { createClient } from "@/lib/supabase/server";
import type { TimetableEntry, Weekday } from "@/lib/data/teacher-schedule";

/** The signed-in teacher's own timetable_entries, resolved to display-ready rows. */
export async function getTimetableForTeacher(teacherId: string): Promise<TimetableEntry[]> {
  const supabase = await createClient();
  // Same untyped-embed caveat as app/admin/classes/page.tsx: PostgREST
  // returns a single object for these many-to-one FKs, but the client
  // without a generated schema infers an array.
  const { data } = await supabase
    .from("timetable_entries")
    .select("id, day, period_id, room, class_teacher_subjects(subject), classes(level, section)")
    .eq("teacher_id", teacherId);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    day: Weekday;
    period_id: string;
    room: string;
    class_teacher_subjects: { subject: string } | null;
    classes: { level: string; section: string } | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    day: row.day,
    periodId: row.period_id,
    className: row.classes ? `${row.classes.level} · ${row.classes.section}` : "",
    subject: row.class_teacher_subjects?.subject ?? "",
    room: row.room,
  }));
}

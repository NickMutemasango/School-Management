import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import {
  TimetableBuilder,
  type AssignmentOption,
  type TimetableEntryRow,
} from "@/components/admin/timetable-builder";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Timetable · Administration",
  description: "Build the weekly schedule for every class.",
};

export default async function TimetablePage() {
  const supabase = await createClient();

  // Embedded selects, same pattern as app/admin/classes/page.tsx - PostgREST
  // resolves the nested objects via the underlying foreign keys.
  const { data: assignmentsData } = await supabase
    .from("class_teacher_subjects")
    .select("id, subject, classes(level, section), profiles(full_name, email)")
    .order("subject");

  const { data: entriesData } = await supabase
    .from("timetable_entries")
    .select(
      "id, day, period_id, room, class_teacher_subjects(subject, profiles(full_name, email)), classes(level, section)"
    );

  const assignmentRows = (assignmentsData ?? []) as unknown as Array<{
    id: string;
    subject: string;
    classes: { level: string; section: string } | null;
    profiles: { full_name: string; email: string } | null;
  }>;

  const assignments: AssignmentOption[] = assignmentRows.map((row) => ({
    id: row.id,
    label: `${row.classes ? `${row.classes.level} · ${row.classes.section}` : "Unknown class"} — ${row.subject} — ${row.profiles?.full_name || row.profiles?.email || "Unknown"}`,
  }));

  const entryRows = (entriesData ?? []) as unknown as Array<{
    id: string;
    day: TimetableEntryRow["day"];
    period_id: string;
    room: string;
    class_teacher_subjects: { subject: string; profiles: { full_name: string; email: string } | null } | null;
    classes: { level: string; section: string } | null;
  }>;

  const entries: TimetableEntryRow[] = entryRows.map((row) => ({
    id: row.id,
    day: row.day,
    periodId: row.period_id,
    room: row.room,
    subject: row.class_teacher_subjects?.subject ?? "",
    teacherName:
      row.class_teacher_subjects?.profiles?.full_name ||
      row.class_teacher_subjects?.profiles?.email ||
      "Unknown",
    className: row.classes ? `${row.classes.level} · ${row.classes.section}` : "Unknown class",
  }));

  return (
    <>
      <PageHeader
        title="Timetable"
        description="Assign a day, period, and room to each teacher's class-subject assignment."
      />
      <TimetableBuilder assignments={assignments} entries={entries} />
    </>
  );
}

import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { TimetablePageTabs } from "@/components/admin/timetable-page-tabs";
import type { AssignmentOption, TimetableEntryRow } from "@/components/admin/timetable-builder";
import type { MasterTimetableEntry, PivotOption } from "@/components/admin/master-timetable-view";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Timetable · Administration",
  description: "Build the weekly schedule for every class.",
};

export default async function TimetablePage() {
  const supabase = await createClient();

  // Embedded selects, same pattern as app/admin/classes/page.tsx - PostgREST
  // resolves the nested objects via the underlying foreign keys. teacher_id
  // and class_id are plain columns on class_teacher_subjects, fetched
  // alongside the embeds so the Master Schedule view can group by either
  // without a second query.
  const { data: assignmentsData } = await supabase
    .from("class_teacher_subjects")
    .select("id, subject, teacher_id, class_id, classes(level, section), profiles(full_name, email)")
    .order("subject");

  const { data: entriesData } = await supabase
    .from("timetable_entries")
    .select(
      "id, day, period_id, room, teacher_id, class_id, class_teacher_subjects(subject, profiles(full_name, email)), classes(level, section)"
    );

  const assignmentRows = (assignmentsData ?? []) as unknown as Array<{
    id: string;
    subject: string;
    teacher_id: string;
    class_id: string;
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
    teacher_id: string;
    class_id: string;
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

  const masterEntries: MasterTimetableEntry[] = entryRows.map((row) => ({
    id: row.id,
    day: row.day,
    periodId: row.period_id,
    room: row.room,
    subject: row.class_teacher_subjects?.subject ?? "",
    teacherId: row.teacher_id,
    teacherName:
      row.class_teacher_subjects?.profiles?.full_name ||
      row.class_teacher_subjects?.profiles?.email ||
      "Unknown",
    classId: row.class_id,
    className: row.classes ? `${row.classes.level} · ${row.classes.section}` : "Unknown class",
  }));

  // Every teacher/class with at least one class-subject assignment, not just
  // those already timetabled - lets an admin pick a teacher/class that has
  // no entries yet and see an all-"Free" grid, useful while still building
  // out the schedule.
  const teachersById = new Map<string, PivotOption>();
  const classesById = new Map<string, PivotOption>();
  for (const row of assignmentRows) {
    if (!teachersById.has(row.teacher_id)) {
      teachersById.set(row.teacher_id, {
        id: row.teacher_id,
        label: row.profiles?.full_name || row.profiles?.email || "Unknown",
      });
    }
    if (row.classes && !classesById.has(row.class_id)) {
      classesById.set(row.class_id, {
        id: row.class_id,
        label: `${row.classes.level} · ${row.classes.section}`,
      });
    }
  }
  const teachers = [...teachersById.values()].sort((a, b) => a.label.localeCompare(b.label));
  const classes = [...classesById.values()].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <PageHeader
        title="Timetable"
        description="Assign a day, period, and room to each teacher's class-subject assignment."
      />
      <TimetablePageTabs
        assignments={assignments}
        entries={entries}
        masterEntries={masterEntries}
        teachers={teachers}
        classes={classes}
      />
    </>
  );
}

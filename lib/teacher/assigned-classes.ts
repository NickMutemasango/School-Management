import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/data/class-levels";

export interface AssignedClass {
  level: string;
  /** Distinct subjects the teacher is assigned to teach at this level. */
  subjects: string[];
}

/**
 * Levels the teacher currently has at least one class-subject assignment in
 * (e.g. "GRADE 5"), each with the subjects assigned to them there - a
 * teacher assigned "Mathematics" in Grade 5A and "English" in Grade 5B sees
 * both listed under "GRADE 5". Ordered by CLASS_LEVELS rather than arbitrary
 * DB row order.
 */
export async function getAssignedClassesForTeacher(teacherId: string): Promise<AssignedClass[]> {
  const supabase = await createClient();
  // Same untyped-embed caveat as app/admin/classes/page.tsx: PostgREST
  // returns a single object for this many-to-one FK, but the client without
  // a generated schema infers an array.
  const { data } = await supabase
    .from("class_teacher_subjects")
    .select("subject, classes(level)")
    .eq("teacher_id", teacherId);

  const rows = (data ?? []) as unknown as Array<{
    subject: string;
    classes: { level: string } | null;
  }>;

  const subjectsByLevel = new Map<string, Set<string>>();
  for (const row of rows) {
    const level = row.classes?.level;
    if (!level) continue;
    const subjects = subjectsByLevel.get(level) ?? new Set<string>();
    subjects.add(row.subject);
    subjectsByLevel.set(level, subjects);
  }

  return CLASS_LEVELS.filter((level) => subjectsByLevel.has(level)).map((level) => ({
    level,
    subjects: Array.from(subjectsByLevel.get(level)!),
  }));
}

export interface AssignedClassSubject {
  /** `class_teacher_subject_id` - what assignments/timetable entries key off. */
  id: string;
  /** e.g. "GRADE 5 · A — Mathematics" */
  label: string;
}

/**
 * The teacher's own class-subject assignments, one per row (unlike
 * `getAssignedClassesForTeacher`, which groups by level) - for pickers that
 * need the exact `class_teacher_subject_id`, like posting an assignment.
 */
export async function getAssignedClassSubjectsForTeacher(
  teacherId: string
): Promise<AssignedClassSubject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_teacher_subjects")
    .select("id, subject, classes(level, section)")
    .eq("teacher_id", teacherId)
    .order("subject");

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    subject: string;
    classes: { level: string; section: string } | null;
  }>;

  return rows
    .filter((row): row is typeof row & { classes: NonNullable<typeof row.classes> } =>
      Boolean(row.classes)
    )
    .map((row) => ({
      id: row.id,
      label: `${row.classes.level} · ${row.classes.section} — ${row.subject}`,
    }));
}

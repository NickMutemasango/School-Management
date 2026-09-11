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

import { createClient } from "@/lib/supabase/server";
import type { Assignment, Submission } from "@/lib/data/assignments";
import { getRosterForTeacher } from "@/lib/teacher/roster";

interface AssignmentRow {
  id: string;
  title: string;
  description: string;
  due_on: string;
  brief_file_name: string | null;
  class_teacher_subjects: {
    subject: string;
    classes: { id: string; level: string; section: string } | null;
  } | null;
  assignment_submissions: Array<{
    id: string;
    submitted_at: string;
    file_name: string;
    file_size: number;
    students: { first_name: string; last_name: string; reg_number: string } | null;
  }>;
}

/** "1.2 MB" - matches the format the student-side upload picker shows. */
function fileSizeLabel(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * The signed-in teacher's own assignments, newest first, with every
 * student's submission attached. No explicit teacher filter - RLS
 * (`assignments_select_teacher` / `assignment_submissions_select_teacher`,
 * migration 0011) already scopes both to the caller's own classes, same
 * "let RLS do the scoping" style as `getRosterForTeacher`.
 */
export async function getAssignmentsForTeacher(): Promise<Assignment[]> {
  const supabase = await createClient();

  const [{ data }, roster] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        `id, title, description, due_on, brief_file_name,
         class_teacher_subjects(subject, classes(id, level, section)),
         assignment_submissions(id, submitted_at, file_name, file_size, students(first_name, last_name, reg_number))`
      )
      .order("created_at", { ascending: false }),
    getRosterForTeacher(),
  ]);

  // Same untyped-embed caveat as elsewhere: PostgREST returns single objects
  // for these many-to-one FKs, but the client without a generated schema
  // infers arrays.
  const rows = (data ?? []) as unknown as AssignmentRow[];

  const classSizeByKey = new Map<string, number>();
  for (const student of roster) {
    const key = `${student.level}|${student.section}`;
    classSizeByKey.set(key, (classSizeByKey.get(key) ?? 0) + 1);
  }

  return rows.map((row) => {
    const cls = row.class_teacher_subjects?.classes ?? null;
    const classKey = cls ? `${cls.level}|${cls.section}` : "";

    const submissions: Submission[] = row.assignment_submissions
      .filter((s) => s.students !== null)
      .map((s) => ({
        id: s.id,
        studentName: `${s.students!.first_name} ${s.students!.last_name}`,
        regNumber: s.students!.reg_number,
        submittedOn: s.submitted_at.slice(0, 10),
        fileName: s.file_name,
        fileSizeLabel: fileSizeLabel(s.file_size),
      }))
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      classLevel: cls ? `${cls.level} · ${cls.section}` : "Unknown class",
      subject: row.class_teacher_subjects?.subject ?? "",
      dueOn: row.due_on,
      fileName: row.brief_file_name ?? "",
      submissions,
      classSize: classSizeByKey.get(classKey) ?? submissions.length,
    };
  });
}

import { createClient } from "@/lib/supabase/server";
import { formatFileSize, type StudentAssignment } from "@/lib/data/student-assignments";

interface AssignmentRow {
  id: string;
  title: string;
  description: string;
  due_on: string;
  brief_file_name: string | null;
  class_teacher_subjects: {
    subject: string;
    profiles: { full_name: string; email: string } | null;
  } | null;
  assignment_submissions: Array<{
    id: string;
    submitted_at: string;
    file_name: string;
    file_size: number;
    note: string;
  }>;
}

/**
 * The signed-in student's own assignments, newest first, each with their own
 * submission if one exists. No explicit student filter - RLS
 * (`assignments_select_student` / `assignment_submissions_select_own`,
 * migration 0011) already scopes both to the caller's own class and own
 * submissions, same "let RLS do the scoping" style as `getMyClass`. Pass
 * `classTeacherSubjectId` to narrow further to one subject - the student's
 * "My Class" selection (assignments already carry this column directly).
 */
export async function getAssignmentsForStudent(
  classTeacherSubjectId?: string
): Promise<StudentAssignment[]> {
  const supabase = await createClient();

  let query = supabase
    .from("assignments")
    .select(
      `id, title, description, due_on, brief_file_name,
       class_teacher_subjects(subject, profiles(full_name, email)),
       assignment_submissions(id, submitted_at, file_name, file_size, note)`
    )
    .order("created_at", { ascending: false });

  if (classTeacherSubjectId) {
    query = query.eq("class_teacher_subject_id", classTeacherSubjectId);
  }

  const { data } = await query;

  // Same untyped-embed caveat as elsewhere: PostgREST returns single objects
  // for these many-to-one FKs, but the client without a generated schema
  // infers arrays. `assignment_submissions` is genuinely one-to-many, but
  // RLS restricts it to at most the caller's own row.
  const rows = (data ?? []) as unknown as AssignmentRow[];

  return rows.map((row) => {
    const submission = row.assignment_submissions[0];
    const teacher = row.class_teacher_subjects?.profiles;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      subject: row.class_teacher_subjects?.subject ?? "",
      teacherName: teacher?.full_name || teacher?.email || "Unknown",
      dueOn: row.due_on,
      briefFileName: row.brief_file_name ?? "",
      submission: submission
        ? {
            id: submission.id,
            fileName: submission.file_name,
            fileSizeLabel: formatFileSize(submission.file_size),
            submittedOn: submission.submitted_at.slice(0, 10),
            note: submission.note,
          }
        : null,
    };
  });
}

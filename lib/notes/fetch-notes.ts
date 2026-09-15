import { createClient } from "@/lib/supabase/server";
import { formatDate, formatFileSize } from "@/lib/utils";
import { extensionFromStoragePath, type ExamBody, type NoteFile } from "@/lib/data/notes";

interface NoteRow {
  id: string;
  file_name: string;
  subject: string;
  exam_body: ExamBody;
  created_at: string;
  file_size: number;
  storage_path: string;
}

/**
 * Notes for a class level, scoped by RLS to whatever the signed-in caller is
 * allowed to see (admin: all, teacher: their assigned levels, student: their
 * own class_level) - the explicit `.eq("level", ...)` filter here matches
 * the RLS boundary rather than relying on it alone, same convention as
 * `getAssignedClassesForTeacher`. Pass `subject` to narrow further to one
 * subject - notes aren't keyed by `class_teacher_subject_id` (`subject` is
 * a free-text column here, not an FK), so this matches on the subject name.
 */
export async function getNotesForLevel(level: string, subject?: string): Promise<NoteFile[]> {
  const supabase = await createClient();
  let query = supabase
    .from("notes")
    .select("id, file_name, subject, exam_body, created_at, file_size, storage_path")
    .eq("level", level)
    .order("created_at", { ascending: false });

  if (subject) {
    query = query.eq("subject", subject);
  }

  const { data } = await query;

  return ((data ?? []) as NoteRow[]).map((row) => ({
    id: row.id,
    name: row.file_name,
    subject: row.subject,
    examBody: row.exam_body,
    uploadedOn: formatDate(row.created_at),
    sizeLabel: formatFileSize(row.file_size),
    fileExt: extensionFromStoragePath(row.storage_path),
  }));
}

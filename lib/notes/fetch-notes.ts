import { createClient } from "@/lib/supabase/server";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { ExamBody, NoteFile } from "@/lib/data/notes";

interface NoteRow {
  id: string;
  file_name: string;
  subject: string;
  exam_body: ExamBody;
  created_at: string;
  file_size: number;
}

/**
 * Notes for a class level, scoped by RLS to whatever the signed-in caller is
 * allowed to see (admin: all, teacher: their assigned levels, student: their
 * own class_level) - the explicit `.eq("level", ...)` filter here matches
 * the RLS boundary rather than relying on it alone, same convention as
 * `getAssignedClassesForTeacher`.
 */
export async function getNotesForLevel(level: string): Promise<NoteFile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("id, file_name, subject, exam_body, created_at, file_size")
    .eq("level", level)
    .order("created_at", { ascending: false });

  return ((data ?? []) as NoteRow[]).map((row) => ({
    id: row.id,
    name: row.file_name,
    subject: row.subject,
    examBody: row.exam_body,
    uploadedOn: formatDate(row.created_at),
    sizeLabel: formatFileSize(row.file_size),
  }));
}

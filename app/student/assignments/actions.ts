"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUploadContentType } from "@/lib/utils";

const ASSIGNMENTS_BUCKET = "assignments";

export interface SubmitAssignmentState {
  error: string | null;
}

/**
 * `assignment_submissions` has no insert/update/delete RLS policies (see
 * migration 0011) - this service-role action is the only write path, and it
 * first confirms the signed-in student is actually a member of the class
 * this assignment belongs to (mirrors the class/level check in
 * `assignStudentToClass`).
 */
export async function submitAssignment(
  _prev: SubmitAssignmentState,
  formData: FormData
): Promise<SubmitAssignmentState> {
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const file = formData.get("file");

  if (!assignmentId) return { error: "Missing assignment." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload before submitting." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("assignments")
    .select("id, class_teacher_subjects(class_id)")
    .eq("id", assignmentId)
    .maybeSingle();

  const classId = (
    assignment?.class_teacher_subjects as unknown as { class_id: string } | null
  )?.class_id;
  if (!assignment || !classId) return { error: "Assignment not found." };

  const { data: membership } = await admin
    .from("student_class_memberships")
    .select("student_id")
    .eq("student_id", user.id)
    .eq("class_id", classId)
    .maybeSingle();
  if (!membership) return { error: "You are not enrolled in this assignment's class." };

  const { data: existing } = await admin
    .from("assignment_submissions")
    .select("storage_path")
    .eq("assignment_id", assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();

  const path = `submissions/${assignmentId}/${user.id}-${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await admin.storage
    .from(ASSIGNMENTS_BUCKET)
    .upload(path, file, { contentType: resolveUploadContentType(file.name, file.type) });
  if (uploadError) return { error: uploadError.message };

  const { error: upsertError } = await admin.from("assignment_submissions").upsert(
    {
      assignment_id: assignmentId,
      student_id: user.id,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      note,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id,student_id" }
  );

  if (upsertError) {
    await admin.storage.from(ASSIGNMENTS_BUCKET).remove([path]);
    return { error: upsertError.message };
  }

  // Replacing a previous submission - clean up the file it pointed at now
  // that the new one is safely recorded.
  if (existing?.storage_path && existing.storage_path !== path) {
    await admin.storage.from(ASSIGNMENTS_BUCKET).remove([existing.storage_path]);
  }

  revalidatePath("/student/assignments");
  revalidatePath("/teacher/assignments");
  return { error: null };
}

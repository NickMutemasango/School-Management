"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUploadContentType } from "@/lib/utils";

const ASSIGNMENTS_BUCKET = "assignments";

export interface CreateAssignmentState {
  error: string | null;
  /** Id of the assignment just created, so the viewer can open it straight away. */
  createdId?: string;
}

/**
 * `assignments` has no insert/update/delete RLS policies (see migration
 * 0011) - this service-role action is the only write path, and it first
 * confirms the signed-in teacher actually owns this exact
 * class_teacher_subject_id (same "RLS covers reads, the action enforces
 * writes" convention as classes/timetable/notes).
 */
export async function createAssignment(
  _prev: CreateAssignmentState,
  formData: FormData
): Promise<CreateAssignmentState> {
  const classTeacherSubjectId = String(formData.get("classTeacherSubjectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueOn = String(formData.get("dueOn") ?? "");
  const brief = formData.get("brief");

  if (!classTeacherSubjectId) {
    return { error: "Choose which class this assignment is for." };
  }
  if (!title) {
    return { error: "Give the assignment a title." };
  }
  if (!dueOn) {
    return { error: "Set a due date so students know the deadline." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("class_teacher_subjects")
    .select("id")
    .eq("id", classTeacherSubjectId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (!assignment) {
    return { error: "You are not assigned to teach this class." };
  }

  let briefStoragePath: string | null = null;
  let briefFileName: string | null = null;
  let briefFileSize: number | null = null;

  if (brief instanceof File && brief.size > 0) {
    const path = `briefs/${classTeacherSubjectId}/${crypto.randomUUID()}-${brief.name}`;
    const { error: uploadError } = await admin.storage
      .from(ASSIGNMENTS_BUCKET)
      .upload(path, brief, { contentType: resolveUploadContentType(brief.name, brief.type) });
    if (uploadError) return { error: uploadError.message };

    briefStoragePath = path;
    briefFileName = brief.name;
    briefFileSize = brief.size;
  }

  const { data: created, error: insertError } = await admin
    .from("assignments")
    .insert({
      class_teacher_subject_id: classTeacherSubjectId,
      title,
      description,
      due_on: dueOn,
      brief_storage_path: briefStoragePath,
      brief_file_name: briefFileName,
      brief_file_size: briefFileSize,
    })
    .select("id")
    .single();

  if (insertError) {
    if (briefStoragePath) await admin.storage.from(ASSIGNMENTS_BUCKET).remove([briefStoragePath]);
    return { error: insertError.message };
  }

  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
  return { error: null, createdId: created.id };
}

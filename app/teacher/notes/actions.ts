"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CLASS_LEVELS, levelSlug } from "@/lib/data/class-levels";
import { SUBJECTS, EXAM_BODIES } from "@/lib/data/notes";

const NOTES_BUCKET = "class-notes";

export interface UploadNoteState {
  error: string | null;
}

/**
 * `notes` has no insert/update/delete RLS policies (see migration 0007) -
 * every write goes through this service-role action, which first checks the
 * signed-in teacher is actually assigned that exact level+subject (RLS only
 * covers reads here, same "RLS as a coarse floor, service-role action
 * enforces write authorization" pattern used for classes/timetable).
 */
export async function uploadNote(
  _prev: UploadNoteState,
  formData: FormData
): Promise<UploadNoteState> {
  const level = String(formData.get("level") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const examBody = String(formData.get("examBody") ?? "");
  const fileName = String(formData.get("fileName") ?? "").trim();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (!level || !(CLASS_LEVELS as readonly string[]).includes(level)) {
    return { error: "Select a valid class level." };
  }
  if (!subject || !(SUBJECTS as readonly string[]).includes(subject)) {
    return { error: "Select a valid subject." };
  }
  if (!(EXAM_BODIES as readonly string[]).includes(examBody)) {
    return { error: "Select a valid exam body." };
  }
  if (!fileName) {
    return { error: "Give the file a display name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("class_teacher_subjects")
    .select("id, classes!inner(level)")
    .eq("teacher_id", user.id)
    .eq("subject", subject)
    .eq("classes.level", level)
    .limit(1)
    .maybeSingle();

  if (!assignment) {
    return { error: "You are not assigned to teach this subject at this level." };
  }

  const path = `${level}/${subject}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await admin.storage
    .from(NOTES_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await admin.from("notes").insert({
    level,
    subject,
    exam_body: examBody,
    teacher_id: user.id,
    file_name: fileName,
    storage_path: path,
    file_size: file.size,
  });

  if (insertError) {
    // Don't leave an orphaned object without a DB row pointing at it.
    await admin.storage.from(NOTES_BUCKET).remove([path]);
    return { error: insertError.message };
  }

  revalidatePath(`/teacher/notes/${levelSlug(level)}`);
  return { error: null };
}

/** Gated to the uploading teacher (or admin) - no RLS delete policy, so this check lives here. */
export async function deleteNote(noteId: string, level: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const admin = createAdminClient();
  const { data: note } = await admin
    .from("notes")
    .select("teacher_id, storage_path")
    .eq("id", noteId)
    .single();
  if (!note) throw new Error("Note not found.");

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isOwner = note.teacher_id === user.id;
  const isAdmin = profile?.role === "admin";
  if (!isOwner && !isAdmin) throw new Error("You can only delete your own notes.");

  await admin.storage.from(NOTES_BUCKET).remove([note.storage_path]);
  const { error } = await admin.from("notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/teacher/notes/${levelSlug(level)}`);
}

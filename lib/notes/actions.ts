"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const NOTES_BUCKET = "class-notes";
const SIGNED_URL_TTL_SECONDS = 60;

export interface DownloadUrlResult {
  url: string | null;
  error: string | null;
}

/**
 * Shared by both portals. The `notes` row lookup goes through the regular
 * client so RLS (admin/teacher-assigned-level/student-own-level) confirms
 * the caller is actually allowed to see this note; the signed URL itself
 * needs the admin client since storage.objects has no client-facing
 * policies at all (private bucket, everything service-role-mediated).
 */
export async function getNoteDownloadUrl(noteId: string): Promise<DownloadUrlResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "You must be signed in." };

  const { data: note } = await supabase
    .from("notes")
    .select("storage_path")
    .eq("id", noteId)
    .single();
  if (!note) return { url: null, error: "Note not found." };

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(NOTES_BUCKET)
    .createSignedUrl(note.storage_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return { url: null, error: error?.message ?? "Could not create a download link." };
  return { url: data.signedUrl, error: null };
}

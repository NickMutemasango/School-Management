"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extensionFromStoragePath } from "@/lib/data/notes";

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
 *
 * `forceDownload` sets Content-Disposition: attachment (a save-as prompt)
 * instead of the default inline response an iframe/img preview needs.
 */
export async function getNoteDownloadUrl(
  noteId: string,
  forceDownload = false
): Promise<DownloadUrlResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "You must be signed in." };

  const { data: note } = await supabase
    .from("notes")
    .select("storage_path, file_name")
    .eq("id", noteId)
    .single();
  if (!note) return { url: null, error: "Note not found." };

  // `file_name` is a free-text display label and often has no extension at
  // all - fall back to whatever the actual uploaded file's storage path
  // ends in, so a forced download still saves with the right file type.
  const ext = extensionFromStoragePath(note.storage_path);
  const downloadName =
    ext && !note.file_name.toLowerCase().endsWith(`.${ext}`) ? `${note.file_name}.${ext}` : note.file_name;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(NOTES_BUCKET)
    .createSignedUrl(
      note.storage_path,
      SIGNED_URL_TTL_SECONDS,
      forceDownload ? { download: downloadName } : undefined
    );

  if (error || !data) return { url: null, error: error?.message ?? "Could not create a download link." };
  return { url: data.signedUrl, error: null };
}

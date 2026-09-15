"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ASSIGNMENTS_BUCKET = "assignments";
const SIGNED_URL_TTL_SECONDS = 60;

export interface DownloadUrlResult {
  url: string | null;
  error: string | null;
}

/**
 * Shared by both portals, mirrors `getNoteDownloadUrl`: the row lookup goes
 * through the regular client so RLS (admin/teacher-owns-class/
 * student-is-a-member) confirms the caller can actually see this
 * assignment; the signed URL needs the admin client since storage.objects
 * has no client-facing policies (private bucket, everything
 * service-role-mediated). `forceDownload` sets Content-Disposition:
 * attachment instead of the inline response a preview needs.
 */
export async function getAssignmentBriefUrl(
  assignmentId: string,
  forceDownload = false
): Promise<DownloadUrlResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "You must be signed in." };

  const { data: assignment } = await supabase
    .from("assignments")
    .select("brief_storage_path, brief_file_name")
    .eq("id", assignmentId)
    .single();
  if (!assignment?.brief_storage_path) return { url: null, error: "No brief attached." };

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(ASSIGNMENTS_BUCKET)
    .createSignedUrl(
      assignment.brief_storage_path,
      SIGNED_URL_TTL_SECONDS,
      forceDownload ? { download: assignment.brief_file_name ?? true } : undefined
    );

  if (error || !data) return { url: null, error: error?.message ?? "Could not create a download link." };
  return { url: data.signedUrl, error: null };
}

export async function getSubmissionDownloadUrl(
  submissionId: string,
  forceDownload = false
): Promise<DownloadUrlResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "You must be signed in." };

  const { data: submission } = await supabase
    .from("assignment_submissions")
    .select("storage_path, file_name")
    .eq("id", submissionId)
    .single();
  if (!submission) return { url: null, error: "Submission not found." };

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(ASSIGNMENTS_BUCKET)
    .createSignedUrl(
      submission.storage_path,
      SIGNED_URL_TTL_SECONDS,
      forceDownload ? { download: submission.file_name } : undefined
    );

  if (error || !data) return { url: null, error: error?.message ?? "Could not create a download link." };
  return { url: data.signedUrl, error: null };
}

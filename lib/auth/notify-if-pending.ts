import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdminsOfPendingStaff } from "@/lib/email/notify-admins";

/**
 * Shared by every place a new session can be established for a first-time
 * signup (OAuth callback, password sign-up with immediate session, and
 * password sign-up that requires email confirmation - via the callback
 * again once confirmed). Only emails once per account, per `notified_at`.
 */
export async function notifyIfPending(userId: string, origin: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("status, notified_at, full_name, email, school_id")
    .eq("id", userId)
    .single();

  if (profile?.status !== "pending" || profile.notified_at) return;

  const { data: settings } = await admin
    .from("school_settings")
    .select("notify_admins_on_staff_signup")
    .eq("school_id", profile.school_id)
    .maybeSingle();

  if (settings?.notify_admins_on_staff_signup === false) return;

  const sent = await notifyAdminsOfPendingStaff(
    { fullName: profile.full_name, email: profile.email },
    origin
  );

  // Only mark as notified if the send actually succeeded - otherwise a
  // failed attempt would never retry on a later sign-in.
  if (sent) {
    await admin.from("profiles").update({ notified_at: new Date().toISOString() }).eq("id", userId);
  }
}

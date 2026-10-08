import { createClient } from "@/lib/supabase/server";

/**
 * Throws unless the signed-in caller is an admin with status "active".
 * Several tables (classes, class_teacher_subjects, timetable_entries,
 * student_class_memberships) have no write RLS policies - service-role
 * mutations against them rely entirely on this check.
 *
 * Returns the admin's school_id and id so callers that need to scope a
 * service-role write to the admin's own school (e.g. level configuration) or
 * attribute it to them (e.g. payments.recorded_by) don't have to run a
 * second lookup - existing callers that only awaited this for its side
 * effect are unaffected.
 */
export async function requireActiveAdmin(): Promise<{ schoolId: string; adminId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" || profile?.status !== "active") {
    throw new Error("Only an active admin can do this.");
  }

  return { schoolId: profile.school_id, adminId: user.id };
}

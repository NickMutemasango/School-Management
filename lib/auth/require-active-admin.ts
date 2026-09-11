import { createClient } from "@/lib/supabase/server";

/**
 * Throws unless the signed-in caller is an admin with status "active".
 * Several tables (classes, class_teacher_subjects, timetable_entries,
 * student_class_memberships) have no write RLS policies - service-role
 * mutations against them rely entirely on this check.
 */
export async function requireActiveAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" || profile?.status !== "active") {
    throw new Error("Only an active admin can do this.");
  }
}

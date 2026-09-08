import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/lib/navigation";

/** Portal-facing label for each role - "Super Admin" reads better than "admin". */
const ROLE_LABEL: Record<string, string> = {
  admin: "Super Admin",
  teacher: "Teacher",
  student: "Student",
};

/**
 * The signed-in user's identity, read from `profiles` rather than the JWT so
 * it reflects admin edits (name changes, role promotions) immediately. Null
 * when signed out - middleware already keeps signed-out visitors off the
 * portals, so callers only need the fallback for the brief window before a
 * redirect lands.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    name: profile.full_name || profile.email,
    email: profile.email,
    role: ROLE_LABEL[profile.role] ?? profile.role,
  };
}

import { cache } from "react";

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
// `cache()`-wrapped: every portal page renders inside `PortalShell`, which
// already calls this once for the sidebar/topbar - without memoizing, each
// page's own call repeats the `auth.getUser()` network round-trip (a real
// hit to Supabase's auth server, not a local check) and the profile query a
// second time for the same request.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.full_name || profile.email,
    email: profile.email,
    role: ROLE_LABEL[profile.role] ?? profile.role,
  };
});

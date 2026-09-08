import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PENDING_NAME_COOKIE } from "@/lib/auth/pending-name-cookie";
import { notifyIfPending } from "@/lib/auth/notify-if-pending";
import { safeNextPath } from "@/lib/auth/safe-next-path";

/**
 * Handles both Google OAuth (`code` from the provider) and email/password
 * signups that require confirmation (`code` from the confirmation link).
 * Redirects to `next` when present (e.g. an admin clicking an approval-email
 * link while signed out) and otherwise to "/" - the middleware routes the
 * now signed-in user to their portal (or /login/pending) based on `profiles`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Self-updates to `profiles` are RLS-blocked (only admins can write),
      // so the name application goes through the service-role client - it
      // only ever touches the just-created user's own row.
      const cookieStore = await cookies();
      const pendingName = cookieStore.get(PENDING_NAME_COOKIE)?.value;
      if (pendingName) {
        await createAdminClient()
          .from("profiles")
          .update({ full_name: pendingName })
          .eq("id", data.user.id);
        cookieStore.delete(PENDING_NAME_COOKIE);
      }

      await notifyIfPending(data.user.id, origin);

      return NextResponse.redirect(`${origin}${next ?? "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login/staff?error=oauth`);
}

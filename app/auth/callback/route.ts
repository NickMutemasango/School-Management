import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
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
      await notifyIfPending(data.user.id, origin);

      return NextResponse.redirect(`${origin}${next ?? "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login/staff?error=oauth`);
}

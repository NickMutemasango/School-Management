"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PENDING_NAME_COOKIE } from "@/lib/auth/pending-name-cookie";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { notifyIfPending } from "@/lib/auth/notify-if-pending";

/**
 * Both the "Sign In" and "Sign Up" tabs call this - Google decides whether
 * the account is new or returning, and `handle_new_user` (SQL trigger)
 * creates the pending profile on first sign-in either way.
 *
 * The Sign Up tab additionally collects a first/last name. Google OAuth
 * doesn't accept custom metadata up front, so the name is stashed in a
 * short-lived cookie and applied to the profile once /auth/callback has an
 * authenticated session to attach it to.
 */
export async function signInWithGoogle(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (fullName) {
    (await cookies()).set(PENDING_NAME_COOKIE, fullName, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
  }

  const next = safeNextPath(String(formData.get("next") ?? ""));

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      // Restricts the Google account picker to the institute's Workspace
      // domain when set - see .env.example.
      ...(process.env.NEXT_STAFF_GOOGLE_HD
        ? { queryParams: { hd: process.env.NEXT_STAFF_GOOGLE_HD } }
        : {}),
    },
  });

  if (error || !data.url) {
    redirect("/login/staff?error=oauth");
  }

  redirect(data.url);
}

export interface StaffSignUpState {
  error: string | null;
  /** True once Supabase has emailed a confirmation link - no session yet. */
  needsConfirmation: boolean;
}

/**
 * Alternative to Google for staff who don't want to use it. Lands in the
 * same teacher/pending state as a Google sign-up (see migration 0004) - the
 * role is never taken from client input, only ever set by the trigger
 * default or an admin's explicit approval.
 */
export async function signUpStaffWithPassword(
  _prev: StaffSignUpState,
  formData: FormData
): Promise<StaffSignUpState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!firstName || !lastName || !email || !password) {
    return { error: "Fill in all fields.", needsConfirmation: false };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", needsConfirmation: false };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match.", needsConfirmation: false };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: `${firstName} ${lastName}` },
      emailRedirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });

  if (error) {
    return { error: error.message, needsConfirmation: false };
  }

  if (!data.session) {
    // Project has "Confirm email" on - no session until they click the link.
    return { error: null, needsConfirmation: true };
  }

  await notifyIfPending(data.user!.id, origin);
  redirect(next ?? "/");
}

export interface StaffSignInState {
  error: string | null;
}

export async function signInStaffWithPassword(
  _prev: StaffSignInState,
  formData: FormData
): Promise<StaffSignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect(next ?? "/");
}

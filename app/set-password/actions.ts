"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  passwordByteLength,
} from "@/lib/auth/validation";

export interface SetPasswordState {
  error: string | null;
}

/**
 * Runs as whoever's currently signed in - auth.updateUser() only ever
 * targets the caller's own account, so there's no id to check. The only
 * caller today is an invited guardian who landed here via
 * HashSessionListener with a session but no password
 * (inviteUserByEmail never collects one); self-service staff already set a
 * password at signup, so this is harmless for them to hit too.
 */
export async function setPassword(
  _prev: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password) {
    return { error: "Enter a password." };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` };
  }
  if (passwordByteLength(password) > PASSWORD_MAX_LENGTH) {
    return { error: `Password must be at most ${PASSWORD_MAX_LENGTH} characters.` };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SELECTED_CHILD_COOKIE } from "@/lib/parent/selected-child";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 180;

/**
 * Records which linked child the rest of the portal (Results, Fees, Notes)
 * should scope to - mirrors app/student/class/actions.ts's
 * selectClassSubject. Confirms the id is actually one of this parent's own
 * children first (students_select_parent, migration 0024) rather than
 * trusting the client.
 */
export async function selectChild(studentId: string, returnTo: string = "/parent") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { data: child } = await supabase.from("students").select("id").eq("id", studentId).maybeSingle();
  if (!child) throw new Error("That student isn't linked to your account.");

  const store = await cookies();
  store.set(SELECTED_CHILD_COOKIE, studentId, {
    maxAge: SIX_MONTHS_SECONDS,
    path: "/",
    sameSite: "lax",
  });

  redirect(returnTo.startsWith("/parent") ? returnTo : "/parent");
}

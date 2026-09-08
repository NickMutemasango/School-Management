"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Runs as the signed-in admin, not the service role - the `profiles_update_admin`
 * RLS policy is what actually authorizes *who* can call this (and rejects it
 * for anyone else). The `.eq(...)`/`.neq(...)` preconditions below are a
 * second layer on top of that: they restrict *which rows* and *which state
 * transitions* are legitimate, so a stray or crafted `profileId` (e.g. a
 * student's) can't be promoted to staff, and a row already in the target
 * state is a no-op rather than a silent state change from an unexpected
 * starting point.
 */
export async function approveStaff(profileId: string, role: "teacher" | "admin") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, status: "active" })
    .eq("id", profileId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

/** Keeps the account (and its history) but blocks sign-in until reconsidered. */
export async function denyStaff(profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", profileId)
    .neq("role", "student");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function reinstateStaff(profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", profileId)
    .eq("status", "suspended")
    .neq("role", "student");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

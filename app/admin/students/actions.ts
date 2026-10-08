"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Runs as the signed-in admin - the `students_update_admin` RLS policy
 * (migration 0003) is what authorizes who can call this. The `.eq(...)`
 * preconditions are a second layer restricting which state transition is
 * legitimate, same convention as app/admin/users/actions.ts.
 */
export async function suspendStudent(studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ status: "inactive" })
    .eq("id", studentId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/students");
}

export async function reinstateStudent(studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ status: "active" })
    .eq("id", studentId)
    .eq("status", "inactive");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/students");
}

/** Deregistration is terminal: there's no action that moves a student back out of it. */
export async function deregisterStudent(studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ status: "deregistered" })
    .eq("id", studentId)
    .neq("status", "deregistered");

  if (error) throw new Error(error.message);
  revalidatePath("/admin/students");
}

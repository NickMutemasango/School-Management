"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/auth/require-active-admin";
import { getRequestOrigin } from "@/lib/auth/request-origin";
import { EMAIL_PATTERN } from "@/lib/auth/validation";

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

export interface InviteGuardianState {
  error: string | null;
  success: boolean;
}

/**
 * Invites the student's existing guardian_email/guardian_name (contact-info
 * columns since migration 0003) as a parent-portal login, linked to this
 * student via parent_students (migration 0024). Unlike student enrollment,
 * a guardian has a real email, so this sends a Supabase invite rather than
 * handing back a temp password - they set their own on first sign-in.
 *
 * A second child with the same guardian_email reuses the existing parent
 * profile rather than erroring or creating a duplicate - only a new link
 * row is added.
 */
export async function inviteGuardian(
  _prev: InviteGuardianState,
  formData: FormData
): Promise<InviteGuardianState> {
  const { schoolId } = await requireActiveAdmin();
  const studentId = String(formData.get("studentId") ?? "");

  const admin = createAdminClient();
  const { data: student } = await admin
    .from("students")
    .select("guardian_name, guardian_email")
    .eq("id", studentId)
    .single();

  if (!student) return { error: "Student not found.", success: false };
  const guardianEmail = student.guardian_email.trim().toLowerCase();
  const guardianName = student.guardian_name.trim();

  if (!guardianEmail || !EMAIL_PATTERN.test(guardianEmail)) {
    return { error: "This student has no valid guardian email on file.", success: false };
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", guardianEmail)
    .eq("role", "parent")
    .eq("school_id", schoolId)
    .maybeSingle();

  let parentProfileId = existing?.id;

  if (!parentProfileId) {
    const origin = await getRequestOrigin();
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      guardianEmail,
      {
        data: { full_name: guardianName },
        redirectTo: `${origin}/auth/callback`,
      }
    );

    if (inviteError || !invited.user) {
      return { error: inviteError?.message ?? "Could not invite this guardian.", success: false };
    }

    // The sign-up trigger (migration 0004) hardcodes every new account to
    // role='teacher', status='pending' - it deliberately ignores whatever
    // role raw_user_meta_data claims, since that's client-suppliable on any
    // public signUp() call and trusting it was a privilege-escalation hole.
    // Only this admin-gated, service-role call is trusted to promote a
    // fresh guardian invite to role='parent', status='active', same as the
    // enrollment flow does for students.
    const { error: promoteError } = await admin
      .from("profiles")
      .update({ role: "parent", status: "active" })
      .eq("id", invited.user.id);

    if (promoteError) {
      await admin.auth.admin.deleteUser(invited.user.id);
      return { error: promoteError.message, success: false };
    }

    parentProfileId = invited.user.id;
  }

  const { error: linkError } = await admin
    .from("parent_students")
    .upsert(
      { school_id: schoolId, parent_profile_id: parentProfileId, student_id: studentId },
      { onConflict: "parent_profile_id,student_id", ignoreDuplicates: true }
    );

  if (linkError) return { error: linkError.message, success: false };

  revalidatePath("/admin/students");
  return { error: null, success: true };
}

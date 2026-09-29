"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/auth/require-active-admin";

/**
 * school_level_offerings has no insert/update/delete RLS policies (see
 * migration 0017) - all mutations go through this service-role client,
 * gated by requireActiveAdmin() below, same convention as classes/
 * class_teacher_subjects. Activating an already-closed level for the same
 * year flips status back to "active" via upsert rather than inserting a
 * second row (the unique(school_id, level_definition_id, academic_year)
 * constraint would reject a duplicate anyway).
 */
export async function activateLevel(levelDefinitionId: string, academicYear: number) {
  const { schoolId } = await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("school_level_offerings").upsert(
    {
      school_id: schoolId,
      level_definition_id: levelDefinitionId,
      academic_year: academicYear,
      status: "active",
    },
    { onConflict: "school_id,level_definition_id,academic_year" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/admin/levels");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/students/enroll");
}

/**
 * Closes rather than deletes the offering - classes already created under
 * it keep their school_level_offering_id (on delete restrict on that FK
 * would block a hard delete anyway once a class references it), they just
 * stop being an option for new classes/enrollments.
 */
export async function deactivateLevel(offeringId: string) {
  const { schoolId } = await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("school_level_offerings")
    .update({ status: "closed" })
    .eq("id", offeringId)
    .eq("school_id", schoolId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/levels");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/students/enroll");
}

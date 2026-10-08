"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/auth/require-active-admin";
import type { Grade } from "@/lib/data/student-results";

export interface SettingsActionState {
  error: string | null;
}

const EDITABLE_GRADES: Grade[] = ["A", "B", "C", "D", "E"];

export async function updateSchoolProfile(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { schoolId } = await requireActiveAdmin();

  const address = String(formData.get("address") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const academicYearStartMonth = Number(formData.get("academicYearStartMonth"));

  if (!Number.isInteger(academicYearStartMonth) || academicYearStartMonth < 1 || academicYearStartMonth > 12) {
    return { error: "Pick a valid academic year start month." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("school_settings")
    .update({
      address,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      academic_year_start_month: academicYearStartMonth,
      updated_at: new Date().toISOString(),
    })
    .eq("school_id", schoolId);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { error: null };
}

export async function updateNotificationPreferences(notifyAdminsOnStaffSignup: boolean) {
  const { schoolId } = await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("school_settings")
    .update({ notify_admins_on_staff_signup: notifyAdminsOnStaffSignup, updated_at: new Date().toISOString() })
    .eq("school_id", schoolId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export interface GradeBandInput {
  grade: Grade;
  min: number;
}

/**
 * The band list itself is fixed (A-E editable, U is always the 0 floor) -
 * this edits thresholds, not which grades exist. Replaces all rows for the
 * school in one go rather than diffing, since there are only ever six.
 */
export async function saveGradeBands(entries: GradeBandInput[]): Promise<SettingsActionState> {
  const { schoolId } = await requireActiveAdmin();

  const byGrade = new Map(entries.map((e) => [e.grade, e.min]));
  for (const grade of EDITABLE_GRADES) {
    const min = byGrade.get(grade);
    if (typeof min !== "number" || !Number.isFinite(min) || min < 0 || min > 100) {
      return { error: `${grade} needs a threshold between 0 and 100.` };
    }
  }

  const ordered = EDITABLE_GRADES.map((grade) => ({ grade, min: byGrade.get(grade)! }));
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].min >= ordered[i - 1].min) {
      return { error: "Each grade's threshold must be lower than the one above it." };
    }
  }

  const rows = [...ordered, { grade: "U" as Grade, min: 0 }].map((entry, i) => ({
    school_id: schoolId,
    grade: entry.grade,
    min_mark: entry.min,
    sort_order: i + 1,
  }));

  const admin = createAdminClient();
  const { error } = await admin
    .from("grade_bands")
    .upsert(rows, { onConflict: "school_id,grade" });

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/student/results");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/analytics");
  return { error: null };
}

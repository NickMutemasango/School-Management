"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/auth/require-active-admin";
import { WEEKDAYS, teachingPeriods } from "@/lib/data/teacher-schedule";

/** Postgres unique-violation error code. */
const UNIQUE_VIOLATION = "23505";

export interface CreateTimetableEntryState {
  error: string | null;
}

/**
 * `timetable_entries` has no insert/update/delete RLS policies (see
 * migration 0006) - all mutations go through this service-role client,
 * gated by requireActiveAdmin() below.
 */
export async function createTimetableEntry(
  _prev: CreateTimetableEntryState,
  formData: FormData
): Promise<CreateTimetableEntryState> {
  await requireActiveAdmin();

  const classTeacherSubjectId = String(formData.get("classTeacherSubjectId") ?? "");
  const day = String(formData.get("day") ?? "");
  const periodId = String(formData.get("periodId") ?? "");
  const room = String(formData.get("room") ?? "").trim();

  if (!classTeacherSubjectId || !day || !periodId) {
    return { error: "Select an assignment, day, and period." };
  }
  if (!(WEEKDAYS as string[]).includes(day)) {
    return { error: "Select a valid day." };
  }
  if (!teachingPeriods.some((p) => p.id === periodId)) {
    return { error: "Select a valid period." };
  }

  const admin = createAdminClient();

  // Never trust client-supplied teacher_id/class_id for the denormalized
  // columns - resolve them server-side from the chosen assignment.
  const { data: assignment, error: lookupError } = await admin
    .from("class_teacher_subjects")
    .select("teacher_id, class_id")
    .eq("id", classTeacherSubjectId)
    .single();

  if (lookupError || !assignment) {
    return { error: "That assignment no longer exists." };
  }

  const { error } = await admin.from("timetable_entries").insert({
    class_teacher_subject_id: classTeacherSubjectId,
    teacher_id: assignment.teacher_id,
    class_id: assignment.class_id,
    day,
    period_id: periodId,
    room,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      if (error.message.includes("timetable_entries_teacher_slot_unique")) {
        return { error: "This teacher already has a lesson in that period." };
      }
      if (error.message.includes("timetable_entries_class_slot_unique")) {
        return { error: "This class already has a lesson in that period." };
      }
      return { error: "That slot is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/timetable");
  return { error: null };
}

export async function deleteTimetableEntry(entryId: string) {
  await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("timetable_entries").delete().eq("id", entryId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/timetable");
}

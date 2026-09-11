"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/auth/require-active-admin";
import { CLASS_LEVELS } from "@/lib/data/class-levels";
import { SUBJECTS } from "@/lib/data/notes";

/** Postgres unique-violation error code. */
const UNIQUE_VIOLATION = "23505";

export interface CreateClassState {
  error: string | null;
}

/**
 * `classes`/`class_teacher_subjects` have no insert/update/delete RLS
 * policies (see migration 0005) - all mutations go through this
 * service-role client, gated by requireActiveAdmin() below.
 */
export async function createClass(
  _prev: CreateClassState,
  formData: FormData
): Promise<CreateClassState> {
  await requireActiveAdmin();

  const level = String(formData.get("level") ?? "");
  const section = String(formData.get("section") ?? "").trim();

  if (!level || !section) {
    return { error: "Select a level and enter a section." };
  }
  if (!(CLASS_LEVELS as readonly string[]).includes(level)) {
    return { error: "Select a valid class level." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("classes").insert({ level, section });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "That class already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/classes");
  return { error: null };
}

export async function deleteClass(classId: string) {
  await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("classes").delete().eq("id", classId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
}

export async function assignTeacher(classId: string, teacherId: string, subject: string) {
  await requireActiveAdmin();

  if (!(SUBJECTS as readonly string[]).includes(subject)) {
    throw new Error("Select a valid subject.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_teacher_subjects")
    .insert({ class_id: classId, teacher_id: teacherId, subject });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw new Error("That teacher is already assigned to this subject in this class.");
    }
    throw new Error(error.message);
  }
  revalidatePath("/admin/classes");
}

export async function removeAssignment(assignmentId: string) {
  await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_teacher_subjects")
    .delete()
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
}

/** Places an enrolled student into a class section - their subjects come from the class itself. */
export async function assignStudentToClass(classId: string, studentId: string) {
  await requireActiveAdmin();

  const admin = createAdminClient();
  const [{ data: cls }, { data: student }] = await Promise.all([
    admin.from("classes").select("id, level").eq("id", classId).maybeSingle(),
    admin.from("students").select("id, class_level").eq("id", studentId).maybeSingle(),
  ]);

  if (!cls || !student) {
    throw new Error("The selected class or student no longer exists.");
  }
  if (cls.level !== student.class_level) {
    throw new Error("A student can only join a class at their enrolled level.");
  }

  const { error } = await admin
    .from("student_class_memberships")
    .upsert({ student_id: studentId, class_id: classId }, { onConflict: "student_id" });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
  revalidatePath("/teacher/students");
}

export async function removeStudentFromClass(studentId: string) {
  await requireActiveAdmin();

  const { error } = await createAdminClient()
    .from("student_class_memberships")
    .delete()
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
  revalidatePath("/teacher/students");
}

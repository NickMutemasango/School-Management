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

/**
 * `assignments`/`assignment_submissions` cascade-delete when this row goes
 * (class_teacher_subject_id on delete cascade, migration 0011) - every
 * assignment the teacher posted for this class-subject, and every
 * student's submission of it, disappears too. Clean up their storage
 * objects first (cascade only removes DB rows, not bucket files) so
 * nothing is left orphaned.
 */
export async function removeAssignment(assignmentId: string) {
  await requireActiveAdmin();

  const admin = createAdminClient();

  const { data: assignments } = await admin
    .from("assignments")
    .select("id, brief_storage_path")
    .eq("class_teacher_subject_id", assignmentId);

  if (assignments && assignments.length > 0) {
    const { data: submissions } = await admin
      .from("assignment_submissions")
      .select("storage_path")
      .in(
        "assignment_id",
        assignments.map((a) => a.id)
      );

    const paths = [
      ...assignments.flatMap((a) => (a.brief_storage_path ? [a.brief_storage_path] : [])),
      ...(submissions ?? []).map((s) => s.storage_path),
    ];
    if (paths.length > 0) {
      await admin.storage.from("assignments").remove(paths);
    }
  }

  const { error } = await admin
    .from("class_teacher_subjects")
    .delete()
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
}

/** Shown to students on their class hub page - see migration 0012. */
export async function updateClassPolicies(classTeacherSubjectId: string, policies: string) {
  await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_teacher_subjects")
    .update({ policies })
    .eq("id", classTeacherSubjectId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
  // Policies are actually rendered on the hub page for this exact subject,
  // not the /student/class listing itself.
  revalidatePath(`/student/class/${classTeacherSubjectId}`);
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

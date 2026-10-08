"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TERM_LABELS, termSlug } from "@/lib/data/terms";
import { levelSlug } from "@/lib/data/class-levels";

export interface SubjectResultEntry {
  studentId: string;
  /** null/undefined leaves the student ungraded rather than writing a 0. */
  mark: number | null;
  comment: string;
}

/**
 * subject_results has no insert/update/delete RLS policies (see migration
 * 0021) - this service-role action is the only write path, and it first
 * confirms the signed-in teacher actually owns this exact
 * class_teacher_subject_id (same "RLS covers reads, the action enforces
 * writes" convention as notes/assignments). Entries without a mark are
 * skipped rather than upserted with 0 - a blank cell means "not graded
 * yet", not "scored zero".
 */
export async function saveSubjectResults(
  classTeacherSubjectId: string,
  term: string,
  academicYear: number,
  entries: SubjectResultEntry[]
) {
  if (!(TERM_LABELS as readonly string[]).includes(term)) {
    throw new Error("Invalid term.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("class_teacher_subjects")
    .select("id, school_id, classes!inner(level)")
    .eq("id", classTeacherSubjectId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (!assignment) throw new Error("You are not assigned to teach this class.");

  const rows = entries
    .filter((e) => typeof e.mark === "number" && Number.isFinite(e.mark))
    .map((e) => {
      if (e.mark === null || e.mark < 0 || e.mark > 100) {
        throw new Error("Marks must be between 0 and 100.");
      }
      return {
        school_id: assignment.school_id,
        class_teacher_subject_id: classTeacherSubjectId,
        student_id: e.studentId,
        term,
        academic_year: academicYear,
        mark: e.mark,
        teacher_comment: e.comment.trim(),
        updated_at: new Date().toISOString(),
      };
    });

  if (rows.length === 0) return;

  const { error } = await admin
    .from("subject_results")
    .upsert(rows, { onConflict: "class_teacher_subject_id,student_id,term,academic_year" });

  if (error) throw new Error(error.message);

  const level = (assignment.classes as unknown as { level: string } | null)?.level;
  revalidatePath("/teacher/reports");
  if (level) revalidatePath(`/teacher/reports/${levelSlug(level)}/${termSlug(term)}`);
  revalidatePath("/student/results");
}

/**
 * class_term_remarks has no insert/update/delete RLS policies either - this
 * action confirms the signed-in teacher is assigned to this class under any
 * subject (there's no single "class teacher" role to check against instead -
 * see migration 0021's header comment).
 */
export async function saveClassTermRemark(
  classId: string,
  term: string,
  academicYear: number,
  comment: string
) {
  if (!(TERM_LABELS as readonly string[]).includes(term)) {
    throw new Error("Invalid term.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("class_teacher_subjects")
    .select("id, school_id, classes!inner(level)")
    .eq("class_id", classId)
    .eq("teacher_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!assignment) throw new Error("You are not assigned to teach this class.");

  const { error } = await admin.from("class_term_remarks").upsert(
    {
      school_id: assignment.school_id,
      class_id: classId,
      term,
      academic_year: academicYear,
      class_teacher_comment: comment.trim(),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "class_id,term,academic_year" }
  );

  if (error) throw new Error(error.message);

  const level = (assignment.classes as unknown as { level: string } | null)?.level;
  if (level) revalidatePath(`/teacher/reports/${levelSlug(level)}/${termSlug(term)}`);
  revalidatePath("/student/results");
}

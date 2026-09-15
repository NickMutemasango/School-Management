"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SELECTED_CLASS_COOKIE } from "@/lib/students/selected-class";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 180;

/**
 * Records which subject the student wants the rest of the portal
 * (Assignments, Class Notes) scoped to. Confirms the id is actually one of
 * the caller's own class_teacher_subjects first - defense in depth, since a
 * tampered id would otherwise just silently show zero results wherever it's
 * used (RLS already scopes those queries), but failing loudly here is a
 * clearer signal than a confusingly empty page.
 *
 * Checks this with a single-row lookup rather than `getMyClass` - that
 * pulls the whole classmates roster too, which this doesn't need and which
 * was doubling the query count on every card click.
 */
export async function selectClassSubject(classTeacherSubjectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  // RLS (class_teacher_subjects_select_own_class) only returns this row if
  // the caller is actually a member of its class - a tampered id just comes
  // back empty.
  const { data: assignment } = await supabase
    .from("class_teacher_subjects")
    .select("id")
    .eq("id", classTeacherSubjectId)
    .maybeSingle();
  if (!assignment) throw new Error("That class isn't yours.");

  const store = await cookies();
  store.set(SELECTED_CLASS_COOKIE, classTeacherSubjectId, {
    maxAge: SIX_MONTHS_SECONDS,
    path: "/",
    sameSite: "lax",
  });

  redirect(`/student/class/${classTeacherSubjectId}`);
}

import { cookies } from "next/headers";

export const SELECTED_CLASS_COOKIE = "selected_class_teacher_subject";

/**
 * The subject (`class_teacher_subject_id`) the student last picked on
 * /student/class - a plain preference cookie, not a capability. It only
 * ever narrows an already RLS-scoped query (assignments/notes the student
 * couldn't see anyway stay invisible regardless of what this cookie holds),
 * so it doesn't need to be signed or httpOnly.
 */
export async function getSelectedClassSubjectId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SELECTED_CLASS_COOKIE)?.value ?? null;
}

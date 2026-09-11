import { createClient } from "@/lib/supabase/server";

export interface RosterStudent {
  id: string;
  firstName: string;
  lastName: string;
  regNumber: string;
  level: string;
  section: string;
}

/**
 * Students in classes the signed-in teacher is assigned to teach. No
 * explicit teacher filter here - `student_class_memberships_select_teacher`
 * (migration 0008) already scopes this to the caller's own classes, and a
 * two-level embedded filter (memberships -> classes -> class_teacher_subjects)
 * isn't reliable PostgREST syntax to layer on top of it.
 */
export async function getRosterForTeacher(): Promise<RosterStudent[]> {
  const supabase = await createClient();

  // Same untyped-embed caveat as elsewhere: PostgREST returns single objects
  // for these many-to-one FKs, but the client without a generated schema
  // infers arrays.
  const { data } = await supabase
    .from("student_class_memberships")
    .select("students(id, first_name, last_name, reg_number), classes(level, section)");

  const rows = (data ?? []) as unknown as Array<{
    students: { id: string; first_name: string; last_name: string; reg_number: string } | null;
    classes: { level: string; section: string } | null;
  }>;

  return rows
    .filter(
      (row): row is typeof row & { students: NonNullable<typeof row.students> } =>
        Boolean(row.students)
    )
    .map((row) => ({
      id: row.students.id,
      firstName: row.students.first_name,
      lastName: row.students.last_name,
      regNumber: row.students.reg_number,
      level: row.classes?.level ?? "",
      section: row.classes?.section ?? "",
    }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));
}

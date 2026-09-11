import { createClient } from "@/lib/supabase/server";

export interface Classmate {
  id: string;
  firstName: string;
  lastName: string;
  regNumber: string;
}

export interface ClassTeacherSubject {
  id: string;
  teacherName: string;
  subject: string;
}

export interface MyClass {
  level: string;
  section: string;
  classmates: Classmate[];
  teachers: ClassTeacherSubject[];
}

/**
 * The signed-in student's own class section: who else is in it, and which
 * teacher teaches each subject. Null when the student hasn't been assigned
 * to a class section yet (admin does this separately from enrollment, via
 * /admin/classes).
 */
export async function getMyClass(studentId: string): Promise<MyClass | null> {
  const supabase = await createClient();

  // Same untyped-embed caveat as elsewhere in this codebase: PostgREST
  // returns a single object for this many-to-one FK, but the client without
  // a generated schema infers an array.
  const { data: membership } = await supabase
    .from("student_class_memberships")
    .select("class_id, classes(level, section)")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!membership) return null;

  const classRow = membership.classes as unknown as { level: string; section: string } | null;
  if (!classRow) return null;

  const [{ data: classmatesData }, { data: teachersData }] = await Promise.all([
    supabase
      .from("student_class_memberships")
      .select("students(id, first_name, last_name, reg_number)")
      .eq("class_id", membership.class_id),
    supabase
      .from("class_teacher_subjects")
      .select("id, subject, profiles(full_name, email)")
      .eq("class_id", membership.class_id),
  ]);

  const classmateRows = (classmatesData ?? []) as unknown as Array<{
    students: { id: string; first_name: string; last_name: string; reg_number: string } | null;
  }>;

  const classmates: Classmate[] = classmateRows
    .filter((row) => row.students && row.students.id !== studentId)
    .map((row) => ({
      id: row.students!.id,
      firstName: row.students!.first_name,
      lastName: row.students!.last_name,
      regNumber: row.students!.reg_number,
    }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const teacherRows = (teachersData ?? []) as unknown as Array<{
    id: string;
    subject: string;
    profiles: { full_name: string; email: string } | null;
  }>;

  const teachers: ClassTeacherSubject[] = teacherRows
    .map((row) => ({
      id: row.id,
      teacherName: row.profiles?.full_name || row.profiles?.email || "Unknown",
      subject: row.subject,
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  return { level: classRow.level, section: classRow.section, classmates, teachers };
}

import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import {
  ClassesTable,
  type ClassGroup,
  type StudentOption,
  type TeacherOption,
} from "@/components/admin/classes-table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Classes · Administration",
  description: "Manage class sections and teacher subject assignments.",
};

export default async function ClassesPage() {
  const supabase = await createClient();

  const { data: classesData } = await supabase
    .from("classes")
    .select("id, level, section")
    .order("level")
    .order("section");

  // First embedded/joined select in the codebase - PostgREST resolves the
  // nested `profiles` object via the class_teacher_subjects.teacher_id ->
  // profiles.id foreign key.
  const { data: assignmentsData } = await supabase
    .from("class_teacher_subjects")
    .select("id, class_id, subject, teacher_id, profiles(full_name, email)");

  const { data: teacherProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "teacher")
    .eq("status", "active")
    .order("full_name");

  const [{ data: studentsData }, { data: membershipsData }] = await Promise.all([
    supabase
      .from("students")
      .select("id, first_name, last_name, reg_number, class_level")
      .eq("status", "active")
      .order("first_name")
      .order("last_name"),
    supabase.from("student_class_memberships").select("student_id, class_id"),
  ]);

  // The untyped client (no generated Database schema) can't infer that
  // `teacher_id` is a single FK, not a reverse relation, so it types the
  // embed as an array - PostgREST actually returns a single object here.
  const assignmentRows = (assignmentsData ?? []) as unknown as Array<{
    id: string;
    class_id: string;
    subject: string;
    teacher_id: string;
    profiles: { full_name: string; email: string } | null;
  }>;

  const assignmentsByClass = new Map<string, ClassGroup["assignments"]>();
  for (const row of assignmentRows) {
    const list = assignmentsByClass.get(row.class_id) ?? [];
    list.push({
      id: row.id,
      teacherId: row.teacher_id,
      teacherName: row.profiles?.full_name || row.profiles?.email || "Unknown",
      subject: row.subject,
    });
    assignmentsByClass.set(row.class_id, list);
  }

  const students: StudentOption[] = (studentsData ?? []).map((row) => ({
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    regNumber: row.reg_number,
    level: row.class_level,
  }));
  const studentById = new Map(students.map((student) => [student.id, student]));

  const studentsByClass = new Map<string, StudentOption[]>();
  for (const membership of membershipsData ?? []) {
    const student = studentById.get(membership.student_id);
    if (!student) continue;
    const list = studentsByClass.get(membership.class_id) ?? [];
    list.push(student);
    studentsByClass.set(membership.class_id, list);
  }

  const classes: ClassGroup[] = (classesData ?? []).map((row) => ({
    id: row.id,
    level: row.level,
    section: row.section,
    assignments: assignmentsByClass.get(row.id) ?? [],
    students: studentsByClass.get(row.id) ?? [],
  }));

  const teachers: TeacherOption[] = (teacherProfiles ?? []).map((row) => ({
    id: row.id,
    name: row.full_name || row.email,
  }));

  return (
    <>
      <PageHeader
        title="Classes"
        description="Create class sections and assign teachers to the subjects they teach."
      />
      <ClassesTable classes={classes} teachers={teachers} students={students} />
    </>
  );
}

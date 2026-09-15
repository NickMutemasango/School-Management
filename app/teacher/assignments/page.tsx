import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { AssignmentsView } from "@/components/teacher/assignments/assignments-view";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAssignedClassSubjectsForTeacher } from "@/lib/teacher/assigned-classes";
import { getAssignmentsForTeacher } from "@/lib/teacher/assignments";

export const metadata: Metadata = {
  title: "Assignments · Teacher Portal",
  description: "Post assignments and review student submissions.",
};

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentUser();
  const [assignedClassSubjects, assignments] = await Promise.all([
    user ? getAssignedClassSubjectsForTeacher(user.id) : Promise.resolve([]),
    getAssignmentsForTeacher(),
  ]);

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Post work for your classes and review what students have handed in."
      />
      <AssignmentsView assignedClassSubjects={assignedClassSubjects} assignments={assignments} />
    </>
  );
}

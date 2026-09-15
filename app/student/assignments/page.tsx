import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StudentAssignmentsView } from "@/components/student/assignments/student-assignments-view";
import { NoClassSelected } from "@/components/student/no-class-selected";
import { getClassSubjectForStudent } from "@/lib/students/classmates";
import { getAssignmentsForStudent } from "@/lib/students/assignments";
import { getSelectedClassSubjectId } from "@/lib/students/selected-class";

export const metadata: Metadata = {
  title: "Assignments · Student Portal",
  description: "Work set by your teachers, and what you've handed in.",
};

export default async function StudentAssignmentsPage() {
  const selectedId = await getSelectedClassSubjectId();
  // Validated, not just "is a cookie present" - if an admin has since removed
  // this subject (or the student was moved to a different class), the
  // cookie can still exist but point at nothing. Rendering on that instead
  // of the raw cookie means a stale selection correctly prompts "pick a
  // class" again instead of showing a misleading empty assignments list.
  const selectedSubject = selectedId ? await getClassSubjectForStudent(selectedId) : null;
  const assignments = selectedSubject ? await getAssignmentsForStudent(selectedId!) : [];

  return (
    <>
      <PageHeader
        title="Assignments"
        description={
          selectedSubject
            ? `Work set for ${selectedSubject.subject}, and what you've handed in.`
            : "Work set by your teachers, and what you've handed in."
        }
      />
      {selectedSubject ? (
        <StudentAssignmentsView assignments={assignments} />
      ) : (
        <NoClassSelected what="assignments" />
      )}
    </>
  );
}

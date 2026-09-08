import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StudentAssignmentsView } from "@/components/student/assignments/student-assignments-view";
import { studentProfile } from "@/lib/data/student";

export const metadata: Metadata = {
  title: "Assignments · Student Portal",
  description: "Work set by your teachers, and what you've handed in.",
};

export default function StudentAssignmentsPage() {
  return (
    <>
      <PageHeader
        title="Assignments"
        description={
          studentProfile.classLevel
            ? `Work set for ${studentProfile.classLevel}, and what you've handed in.`
            : "Work set by your teachers, and what you've handed in."
        }
      />
      <StudentAssignmentsView />
    </>
  );
}

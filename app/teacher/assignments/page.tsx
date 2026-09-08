import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { AssignmentsView } from "@/components/teacher/assignments/assignments-view";

export const metadata: Metadata = {
  title: "Assignments · Teacher Portal",
  description: "Post assignments and review student submissions.",
};

export default function TeacherAssignmentsPage() {
  return (
    <>
      <PageHeader
        title="Assignments"
        description="Post work for your classes and review what students have handed in."
      />
      <AssignmentsView />
    </>
  );
}

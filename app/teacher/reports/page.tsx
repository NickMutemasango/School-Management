import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ReportsClassList } from "@/components/teacher/reports/reports-class-list";
import { reportClasses } from "@/lib/data/teacher-reports";

export const metadata: Metadata = {
  title: "End of Term Reports — Teacher Portal",
  description: "Create and edit student reports by class and term.",
};

export default function TeacherReportsPage() {
  return (
    <>
      <PageHeader
        title="Class Reports"
        description="Select a class, then choose a term to create or edit student reports."
      />
      <ReportsClassList classes={reportClasses} />
    </>
  );
}

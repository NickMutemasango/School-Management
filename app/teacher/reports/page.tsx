import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ReportsClassList } from "@/components/teacher/reports/reports-class-list";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getReportLevelsForTeacher } from "@/lib/teacher/reports";

export const metadata: Metadata = {
  title: "End of Term Reports · Teacher Portal",
  description: "Create and edit student reports by class and term.",
};

export default async function TeacherReportsPage() {
  const user = await getCurrentUser();
  const classes = user ? await getReportLevelsForTeacher(user.id) : [];

  return (
    <>
      <PageHeader
        title="Class Reports"
        description="Select a class, then choose a term to create or edit student reports."
      />
      <ReportsClassList classes={classes} />
    </>
  );
}

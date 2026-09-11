import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ReportsClassList } from "@/components/teacher/reports/reports-class-list";
import { reportClasses } from "@/lib/data/teacher-reports";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAssignedClassesForTeacher } from "@/lib/teacher/assigned-classes";

export const metadata: Metadata = {
  title: "End of Term Reports · Teacher Portal",
  description: "Create and edit student reports by class and term.",
};

export default async function TeacherReportsPage() {
  const user = await getCurrentUser();
  const assigned = user ? await getAssignedClassesForTeacher(user.id) : [];
  const subjectsByLevel = new Map(assigned.map((c) => [c.level, c.subjects]));

  const classes = reportClasses
    .filter((c) => subjectsByLevel.has(c.level))
    .map((c) => ({ ...c, subjects: subjectsByLevel.get(c.level) }));

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

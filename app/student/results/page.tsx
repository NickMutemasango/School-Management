import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ResultsView } from "@/components/student/results/results-view";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getGradeBands } from "@/lib/admin/grade-bands";
import { getResultsForStudent } from "@/lib/students/results";

export const metadata: Metadata = {
  title: "Results · Student Portal",
  description: "Your term results and progress across every subject.",
};

export default async function StudentResultsPage() {
  const user = await getCurrentUser();
  const [termResults, bands] = await Promise.all([
    user ? getResultsForStudent(user.id) : Promise.resolve([]),
    getGradeBands(),
  ]);

  return (
    <>
      <PageHeader
        title="Results"
        description="Term results and progress across every subject."
      />
      <ResultsView terms={termResults} bands={bands} />
    </>
  );
}

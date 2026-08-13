import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ResultsView } from "@/components/student/results/results-view";
import { termResults } from "@/lib/data/student-results";

export const metadata: Metadata = {
  title: "Results — Student Portal",
  description: "Your term results and progress across every subject.",
};

export default function StudentResultsPage() {
  return (
    <>
      <PageHeader
        title="Results"
        description="Term results and progress across every subject."
      />
      <ResultsView terms={termResults} />
    </>
  );
}

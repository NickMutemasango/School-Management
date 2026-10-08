import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ReportLevelList } from "@/components/admin/reports/report-level-list";
import { getReportLevelsForAdmin } from "@/lib/admin/reports";

export const metadata: Metadata = {
  title: "Reports · Administration",
  description: "Browse end-of-term reports across every class.",
};

export default async function ReportsPage() {
  const levels = await getReportLevelsForAdmin();

  return (
    <>
      <PageHeader
        title="Reports"
        description="Browse end-of-term reports across every class."
      />
      <ReportLevelList levels={levels} />
    </>
  );
}

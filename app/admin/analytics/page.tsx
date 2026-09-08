import type { Metadata } from "next";
import { BarChart3 as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Analytics · Administration",
  description: "Reporting and insight across the portal.",
};

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Analytics"
      description="Trends across enrolment, attendance, and revenue."
    />
  );
}
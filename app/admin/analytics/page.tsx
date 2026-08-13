import { BarChart3 as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Analytics"
      description="Trends across enrolment, attendance, and revenue."
    />
  );
}
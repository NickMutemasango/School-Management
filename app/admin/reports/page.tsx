import type { Metadata } from "next";
import { FileText as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Reports · Administration",
  description: "Generated reports across the portal.",
};

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Reports"
      description="Generate and export institutional reports."
    />
  );
}
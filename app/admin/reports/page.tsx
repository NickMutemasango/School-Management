import { FileText as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Reports"
      description="Generate and export institutional reports."
    />
  );
}
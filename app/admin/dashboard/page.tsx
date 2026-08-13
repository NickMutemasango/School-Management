import { House as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function DashboardPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Dashboard"
      description="Portal-wide overview and key metrics."
    />
  );
}
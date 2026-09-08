import type { Metadata } from "next";
import { House as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Dashboard · Administration",
  description: "Portal-wide overview and key metrics.",
};

export default function DashboardPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Dashboard"
      description="Portal-wide overview and key metrics."
    />
  );
}
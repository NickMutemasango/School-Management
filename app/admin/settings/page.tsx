import type { Metadata } from "next";
import { Settings as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Settings · Administration",
  description: "Account and portal settings.",
};

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Settings"
      description="Portal configuration and preferences."
    />
  );
}
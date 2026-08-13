import { Settings as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Settings"
      description="Portal configuration and preferences."
    />
  );
}
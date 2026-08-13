import { Users as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function UsersPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Users"
      description="Manage portal accounts and role assignments."
    />
  );
}
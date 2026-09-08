import type { Metadata } from "next";
import { Users as PageIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Users · Administration",
  description: "Manage portal accounts and role assignments.",
};

export default function UsersPage() {
  return (
    <ModulePlaceholder
      icon={PageIcon}
      title="Users"
      description="Manage portal accounts and role assignments."
    />
  );
}
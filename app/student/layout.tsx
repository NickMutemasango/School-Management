import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/portal-shell";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <PortalShell portal="student">{children}</PortalShell>;
}

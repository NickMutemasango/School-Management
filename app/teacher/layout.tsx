import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/portal-shell";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <PortalShell portal="teacher">{children}</PortalShell>;
}

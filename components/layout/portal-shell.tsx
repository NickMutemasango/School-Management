import type { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { PortalContent } from "./portal-content";
import { SidebarProvider } from "./sidebar-provider";
import type { PortalKey } from "@/lib/navigation";

interface PortalShellProps {
  portal: PortalKey;
  children: ReactNode;
}

/**
 * Shared chrome for every portal: fixed sidebar, sticky top bar, content well.
 * `/admin`, `/teacher`, and `/student` each mount this with their own key.
 */
export function PortalShell({ portal, children }: PortalShellProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <AppSidebar portal={portal} />
        <PortalContent>{children}</PortalContent>
      </div>
    </SidebarProvider>
  );
}

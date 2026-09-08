import type { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { PortalContent } from "./portal-content";
import { SidebarProvider } from "./sidebar-provider";
import type { PortalKey } from "@/lib/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

interface PortalShellProps {
  portal: PortalKey;
  children: ReactNode;
}

/**
 * Shared chrome for every portal: fixed sidebar, sticky top bar, content well.
 * `/admin`, `/teacher`, and `/student` each mount this with their own key.
 * Fetches the signed-in user once here (Server Component) and hands it down,
 * rather than each of the sidebar/topbar pieces reading a static fallback.
 */
export async function PortalShell({ portal, children }: PortalShellProps) {
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <AppSidebar portal={portal} user={user} />
        <PortalContent user={user}>{children}</PortalContent>
      </div>
    </SidebarProvider>
  );
}

"use client";

import type { ReactNode } from "react";

import { Topbar } from "./topbar";
import { Breadcrumbs } from "./breadcrumbs";
import { useSidebar } from "./sidebar-provider";
import { cn } from "@/lib/utils";

/**
 * Content well beside the sidebar. Reads the collapse state so the desktop
 * offset tracks whether the sidebar rail is showing.
 */
export function PortalContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "transition-[padding] duration-300 ease-out",
        collapsed ? "lg:pl-0" : "lg:pl-60"
      )}
    >
      <div className="bg-background min-h-screen">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

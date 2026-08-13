"use client";

import * as React from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

interface SidebarContextValue {
  /** Mobile off-canvas drawer state. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** Desktop collapse state - hides the sidebar and widens the content well. */
  collapsed: boolean;
  /**
   * Header toggle. Collapses the rail on desktop, opens the drawer on mobile,
   * so the control is never dead at any breakpoint.
   */
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const toggle = React.useCallback(() => {
    const isDesktop =
      typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;

    if (isDesktop) {
      setCollapsed((c) => !c);
    } else {
      setOpenMobile((o) => !o);
    }
  }, []);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ openMobile, setOpenMobile, collapsed, toggle }),
    [openMobile, collapsed, toggle]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

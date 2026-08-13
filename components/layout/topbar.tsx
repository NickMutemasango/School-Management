"use client";

import { Bell, Menu } from "lucide-react";

import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./sidebar-provider";
import { notificationCount } from "@/lib/navigation";

export function Topbar() {
  const { toggle } = useSidebar();

  return (
    <header className="bg-background/90 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800">
      <button
        onClick={toggle}
        aria-label="Toggle navigation"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          aria-label={`Notifications (${notificationCount} unread)`}
          className="relative grid size-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Bell className="size-[18px]" />
          {notificationCount > 0 && (
            <span className="ring-background absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] leading-[18px] font-semibold text-white ring-2">
              {notificationCount}
            </span>
          )}
        </button>

        <ThemeToggle />

        <UserMenu />
      </div>
    </header>
  );
}

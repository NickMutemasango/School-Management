"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Menu } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./sidebar-provider";
import { markNotificationsRead } from "@/lib/notifications/actions";
import type { CurrentUser } from "@/lib/navigation";
import type { NotificationSummary } from "@/lib/notifications/notification-summary";

interface TopbarProps {
  user: CurrentUser | null;
  notification: NotificationSummary;
}

export function Topbar({ user, notification }: TopbarProps) {
  const { toggle } = useSidebar();

  // Notifications are recomputed server-side on every navigation (there's
  // no row to delete) - dismissing here just masks the item locally so it
  // doesn't flash back before the next full navigation re-fetches with the
  // read-state already persisted (lib/notifications/actions.ts).
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const visibleItems = notification.items.filter((item) => !dismissed.has(item.id));
  const visibleCount = Math.max(0, notification.count - dismissed.size);

  function dismiss(keys: string[]) {
    setDismissed((prev) => new Set([...prev, ...keys]));
    void markNotificationsRead(keys);
  }

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
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Notifications (${visibleCount} needing attention)`}
            className="relative grid size-9 place-items-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Bell className="size-[18px]" />
            {visibleCount > 0 && (
              <span className="ring-background absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] leading-[18px] font-semibold text-white ring-2">
                {visibleCount}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {visibleItems.length > 0 && (
                <button
                  onClick={() => dismiss(visibleItems.map((item) => item.id))}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />

            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <CheckCircle2 className="size-6 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up</p>
              </div>
            ) : (
              <>
                {visibleItems.map((item) => (
                  <DropdownMenuItem key={item.id} asChild onClick={() => dismiss([item.id])}>
                    <Link href={item.href}>{item.message}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={notification.viewAllHref} className="justify-center font-medium">
                    View all
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <UserMenu user={user} />
      </div>
    </header>
  );
}

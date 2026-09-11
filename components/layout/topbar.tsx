"use client";

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
import type { CurrentUser } from "@/lib/navigation";
import type { NotificationSummary } from "@/lib/notifications/notification-summary";

interface TopbarProps {
  user: CurrentUser | null;
  notification: NotificationSummary;
}

export function Topbar({ user, notification }: TopbarProps) {
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
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Notifications (${notification.count} needing attention)`}
            className="relative grid size-9 place-items-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Bell className="size-[18px]" />
            {notification.count > 0 && (
              <span className="ring-background absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] leading-[18px] font-semibold text-white ring-2">
                {notification.count}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {notification.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <CheckCircle2 className="size-6 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">You're all caught up</p>
              </div>
            ) : (
              <>
                {notification.items.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
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

"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navByPortal, type PortalKey } from "@/lib/navigation";
import { initials } from "@/lib/utils";

/** Profile card pinned to the bottom of the sidebar. */
export function SidebarUser({ portal }: { portal: PortalKey }) {
  const currentUser = navByPortal[portal].user;
  // Only the admin portal has a settings route; other portals show sign-out only.
  const settingsHref = portal === "admin" ? "/admin/settings" : null;
  const isSignedIn = currentUser.name !== "";

  return (
    <div className="shrink-0 border-t border-slate-200 p-2.5 dark:border-slate-800">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:hover:bg-slate-800/60">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-800 text-[11px] font-semibold text-white dark:bg-slate-700">
            {isSignedIn ? initials(currentUser.name) : <UserRound className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-tight font-semibold">
              {isSignedIn ? currentUser.name : "Not signed in"}
            </span>
            <span className="block truncate text-[11px] leading-tight text-slate-500 dark:text-slate-400">
              {isSignedIn ? currentUser.role : "Connect an auth provider"}
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="top" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-semibold">
              {isSignedIn ? currentUser.name : "Not signed in"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {isSignedIn ? currentUser.email : "No account connected"}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {settingsHref && (
            <>
              <DropdownMenuItem asChild>
                <Link href={settingsHref}>
                  <UserRound className="size-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={settingsHref}>
                  <Settings className="size-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem variant="destructive" asChild>
            <Link href="/login">
              <LogOut className="size-4" />
              Sign out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

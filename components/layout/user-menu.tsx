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
import { currentUser } from "@/lib/navigation";
import { initials } from "@/lib/utils";

/** Compact avatar pill in the header bar. */
export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 flex items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
        <span className="grid size-9 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {initials(currentUser.name)}
        </span>
        <ChevronDown className="size-4 text-slate-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold">{currentUser.name}</p>
          <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <UserRound className="size-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings className="size-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" asChild>
          <Link href="/login">
            <LogOut className="size-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

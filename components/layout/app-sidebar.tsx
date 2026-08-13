"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { navByPortal, type NavItem, type PortalKey } from "@/lib/navigation";
import { useSidebar } from "./sidebar-provider";
import { SidebarUser } from "./sidebar-user";

interface AppSidebarProps {
  portal: PortalKey;
}

export function AppSidebar({ portal }: AppSidebarProps) {
  const { brand, sections } = navByPortal[portal];
  const { openMobile, setOpenMobile, collapsed } = useSidebar();
  const BrandIcon = brand.icon;

  return (
    <>
      {/* Mobile scrim */}
      <div
        aria-hidden={!openMobile}
        onClick={() => setOpenMobile(false)}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] transition-opacity lg:hidden",
          openMobile ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "bg-background fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200 transition-transform duration-300 ease-out",
          "dark:border-slate-800",
          openMobile ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:-translate-x-full" : "lg:translate-x-0"
        )}
      >
        {/* Branding */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-4">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-white shadow-sm">
            <BrandIcon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-tight font-bold tracking-tight">
              {brand.title}
            </p>
            <p className="truncate text-[11px] leading-tight text-slate-500 dark:text-slate-400">
              {brand.subtitle}
            </p>
          </div>

          <button
            onClick={() => setOpenMobile(false)}
            className="-mr-1 grid size-7 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pt-1 pb-3">
          {sections.map((section) => (
            <div key={section.label} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                {section.label}
              </p>

              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <SidebarLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User profile card */}
        <SidebarUser portal={portal} />
      </aside>
    </>
  );
}

function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;

  const isActive =
    pathname === item.href ||
    (item.activePrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false);

  return (
    <Link
      href={item.href}
      onClick={() => setOpenMobile(false)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors duration-150",
        isActive
          ? // Soft blue pill highlight, vibrant blue icon + label
            "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
        )}
      />
      <span className="truncate">{item.title}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

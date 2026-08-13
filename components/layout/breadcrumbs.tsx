"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { levelFromSlug } from "@/lib/data/class-levels";

/** Path segments that should render with specific copy rather than title-case. */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Administration",
  teacher: "Teacher Portal",
  student: "Student Portal",
  students: "Student Management",
  finance: "Finance & Accounting",
  invoices: "Invoices",
  fees: "Fee Structure",
  enroll: "Enrollment",
  notes: "Class Notes",
  reports: "End of Term Reports",
  schedule: "Timetable",
};

function labelFor(segment: string) {
  return (
    SEGMENT_LABELS[segment] ??
    // Dynamic route slugs resolve to a display name where we know one,
    // so "ecd" reads as "ECD" rather than title-cased "Ecd".
    levelFromSlug(segment) ??
    segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Portal roots (e.g. /admin) don't need a trail - the page title says it.
  if (segments.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 min-w-0">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {segments.map((segment, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;

          return (
            <li key={href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
              {isLast ? (
                <span className="truncate font-medium" aria-current="page">
                  {labelFor(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="truncate text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {labelFor(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

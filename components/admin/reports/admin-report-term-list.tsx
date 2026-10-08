import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { levelSlug } from "@/lib/data/class-levels";
import type { AdminReportTerm } from "@/lib/admin/reports";

export function AdminReportTermList({ level, terms }: { level: string; terms: AdminReportTerm[] }) {
  if (terms.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={CalendarDays}
          title="No terms available"
          description="Academic terms will be listed here once classes have subject assignments."
        />
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {terms.map((term) => (
        <li
          key={term.id}
          className={cn(
            "bg-background rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
            term.current ? "border-blue-500" : "border-slate-200 dark:border-slate-800"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <CalendarDays className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
              {term.label}
            </h2>

            {term.current && (
              <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                Current
              </span>
            )}
          </div>

          <dl className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <dt className="sr-only">Fully graded</dt>
              <dd>
                <span className="font-medium tabular-nums">{term.saved}</span> class
                {term.saved === 1 ? "" : "es"} fully graded
              </dd>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Clock className="size-4 shrink-0 text-amber-500" />
              <dt className="sr-only">Pending</dt>
              <dd>
                <span className="font-medium tabular-nums">{term.pending}</span> pending
              </dd>
            </div>
          </dl>

          <Link
            href={`/admin/reports/${levelSlug(level)}/${term.id}`}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            View reports
          </Link>
        </li>
      ))}
    </ul>
  );
}

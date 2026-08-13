import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import type { ReportTerm } from "@/lib/data/teacher-reports";

export function ReportTermList({ terms }: { terms: ReportTerm[] }) {
  if (terms.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={CalendarDays}
          title="No terms available"
          description="Academic terms open for report entry will be listed here."
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
            term.current
              ? "border-emerald-500"
              : "border-slate-200 dark:border-slate-800"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <CalendarDays className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {term.label}
            </h2>

            {term.current && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                Current
              </span>
            )}
          </div>

          <dl className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <dt className="sr-only">Saved</dt>
              <dd>
                <span className="font-medium tabular-nums">
                  {term.savedSubjects}
                </span>{" "}
                with saved subjects
              </dd>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Clock className="size-4 shrink-0 text-amber-500" />
              <dt className="sr-only">Pending</dt>
              <dd>
                <span className="font-medium tabular-nums">{term.pending}</span>{" "}
                pending
              </dd>
            </div>
          </dl>

          <button
            type="button"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            Continue reports
          </button>
        </li>
      ))}
    </ul>
  );
}

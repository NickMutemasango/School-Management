"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, GraduationCap, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { levelSlug } from "@/lib/data/class-levels";
import type { ReportClass } from "@/lib/data/teacher-reports";

export function ReportsClassList({ classes }: { classes: ReportClass[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.level.toLowerCase().includes(q));
  }, [classes, query]);

  return (
    <>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Enter marks for the relevant subjects. The final report collates all
        subjects from all teachers so students get one report with every subject.
      </p>

      <button
        type="button"
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-emerald-500 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:outline-none dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      >
        <Eye className="size-4" />
        View example report (mock-up)
      </button>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search classes..."
          aria-label="Search classes"
          className="bg-background h-12 w-full rounded-xl border border-slate-200 pr-4 pl-11 text-sm shadow-sm outline-none transition-shadow placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={GraduationCap}
            title="No classes found"
            description="Try a different search term."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cls) => (
            <div
              key={cls.level}
              className="bg-background flex flex-col rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
            >
              <h2 className="text-lg font-bold tracking-tight">{cls.level}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {cls.studentCount} student{cls.studentCount === 1 ? "" : "s"}
              </p>

              <Link
                href={`/teacher/reports/${levelSlug(cls.level)}`}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-500/30 focus-visible:outline-none"
              >
                Choose Term
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

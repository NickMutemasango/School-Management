"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { levelSlug } from "@/lib/data/class-levels";
import type { AdminReportLevel } from "@/lib/admin/reports";

export function ReportLevelList({ levels }: { levels: AdminReportLevel[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return levels;
    return levels.filter((l) => l.level.toLowerCase().includes(q));
  }, [levels, query]);

  return (
    <>
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
            title={levels.length === 0 ? "No classes yet" : "No classes found"}
            description={
              levels.length === 0
                ? "Classes and class-subject assignments will appear here once set up."
                : "Try a different search term."
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lvl) => (
            <div
              key={lvl.level}
              className="bg-background flex flex-col rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
            >
              <h2 className="text-lg font-bold tracking-tight">{lvl.level}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {lvl.classCount} class{lvl.classCount === 1 ? "" : "es"} &middot;{" "}
                {lvl.studentCount} student{lvl.studentCount === 1 ? "" : "s"}
              </p>

              <Link
                href={`/admin/reports/${levelSlug(lvl.level)}`}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none"
              >
                View Terms
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

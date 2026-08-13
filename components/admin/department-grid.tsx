"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { departments } from "@/lib/data/departments";

export function DepartmentGrid() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      {/* Search */}
      <div className="relative mt-6 w-full max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search departments and modules..."
          aria-label="Search departments and modules"
          className="bg-background h-12 w-full rounded-xl border border-slate-200 pr-4 pl-11 text-sm text-slate-900 shadow-sm outline-none transition-shadow placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Department cards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((dept) => {
          const Icon = dept.icon;
          return (
            <Link
              key={dept.id}
              href={dept.href}
              className="group bg-background flex flex-col rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:border-slate-800 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`grid size-[52px] shrink-0 place-items-center rounded-2xl ${dept.tone}`}
                >
                  <Icon className="size-6" />
                </div>
                <ArrowRight className="mt-1 size-[18px] shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>

              <h2 className="mt-5 text-lg leading-snug font-bold tracking-tight">
                {dept.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {dept.description}
              </p>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-800">
          <p className="font-medium">No departments found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No department matches &ldquo;{query}&rdquo;.
          </p>
        </div>
      )}
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { levelSlug } from "@/lib/data/class-levels";
import type { AssignedClass } from "@/lib/teacher/assigned-classes";

export function NotesClassList({ classes }: { classes: readonly AssignedClass[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.level.toLowerCase().includes(q) ||
        c.subjects.some((s) => s.toLowerCase().includes(q))
    );
  }, [classes, query]);

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
            title={classes.length === 0 ? "No classes assigned yet" : "No classes found"}
            description={
              classes.length === 0
                ? "An admin hasn't assigned you to any classes yet."
                : "Try a different search term."
            }
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((cls) => (
            <li key={cls.level}>
              <Link
                href={`/teacher/notes/${levelSlug(cls.level)}`}
                className="bg-background group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:border-slate-800 dark:hover:border-slate-700"
              >
                <GraduationCap className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span className="font-medium">{cls.level}</span>
                  {cls.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </span>
                <ChevronRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

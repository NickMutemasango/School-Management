import type { LucideIcon } from "lucide-react";
import { Award, BookOpen, Medal, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { isPass, type TermResult } from "@/lib/data/student-results";

interface SummaryTile {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
  valueTone?: string;
}

export function ResultsSummary({ term }: { term: TermResult }) {
  const passes = term.subjects.filter((s) => isPass(s.mark)).length;

  const tiles: SummaryTile[] = [
    {
      label: "Overall Average",
      value: `${term.average}%`,
      caption: "Across all subjects",
      icon: TrendingUp,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      valueTone:
        term.average >= 50 ? "text-emerald-600" : "text-rose-600",
    },
    {
      label: "Class Position",
      value: term.position ? `${term.position}` : "—",
      caption: term.classSize ? `out of ${term.classSize}` : "Not published",
      icon: Medal,
      tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
    },
    {
      label: "Subjects Passed",
      value: `${passes}/${term.subjects.length}`,
      caption: "Grade C or better",
      icon: Award,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      label: "Subjects Taken",
      value: String(term.subjects.length),
      caption: "This term",
      icon: BookOpen,
      tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.label}
            className="bg-background rounded-2xl border border-slate-200 p-5 shadow-sm dark:border-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {tile.label}
              </p>
              <div
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  tile.tone
                )}
              >
                <Icon className="size-5" />
              </div>
            </div>

            <p
              className={cn(
                "mt-4 text-3xl font-bold tracking-tight",
                tile.valueTone
              )}
            >
              {tile.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {tile.caption}
            </p>
          </div>
        );
      })}
    </div>
  );
}

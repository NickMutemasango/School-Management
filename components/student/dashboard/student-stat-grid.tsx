import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarCheck, TrendingUp, Wallet } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import type { StudentStats } from "@/lib/data/student";

interface StatTile {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
  /** Highlights an outstanding balance in red. */
  valueTone?: string;
}

export function StudentStatGrid({ stats }: { stats: StudentStats }) {
  const tiles: StatTile[] = [
    {
      label: "Fee Balance",
      value: formatCurrency(stats.feeBalance),
      caption: stats.feeBalance > 0 ? "Outstanding" : "Nothing outstanding",
      icon: Wallet,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      valueTone: stats.feeBalance > 0 ? "text-rose-600" : undefined,
    },
    {
      label: "Term Average",
      value: `${stats.termAverage}%`,
      caption: "Across graded work",
      icon: TrendingUp,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      label: "Attendance",
      value: `${stats.attendanceRate}%`,
      caption: "This term",
      icon: CalendarCheck,
      tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
    },
    {
      label: "Notes Available",
      value: String(stats.notesAvailable),
      caption: "Files to download",
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
            className="bg-background rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
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

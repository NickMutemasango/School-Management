import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarDays, CalendarRange, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TeacherStats } from "@/lib/data/teacher";

interface StatTile {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
}

export function TeacherStatGrid({ stats }: { stats: TeacherStats }) {
  const tiles: StatTile[] = [
    {
      label: "Lessons Today",
      value: String(stats.lessonsToday),
      caption: "On your timetable",
      icon: CalendarDays,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      label: "Lessons This Week",
      value: String(stats.lessonsThisWeek),
      caption: "Across all classes",
      icon: CalendarRange,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      label: "Classes Taught",
      value: String(stats.classesTaught),
      caption: "Assigned this term",
      icon: GraduationCap,
      tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
    },
    {
      label: "Subjects",
      value: String(stats.subjectsTaught),
      caption: "In your allocation",
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

            <p className="mt-4 text-3xl font-bold tracking-tight">{tile.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {tile.caption}
            </p>
          </div>
        );
      })}
    </div>
  );
}

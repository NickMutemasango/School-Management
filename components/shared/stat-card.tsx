import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Icon-chip palette. Named rather than a free-form class string so a call site
 * can't ship a light-only chip - every tone carries its dark pair here, once.
 * Matches the tile palette used by the student and teacher dashboards.
 */
const TONES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
  violet:
    "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
} as const;

export type StatTone = keyof typeof TONES;

interface StatCardProps {
  label: string;
  value: string;
  /** Sub-label under the title, e.g. a date range, or a link. */
  caption?: ReactNode;
  /** Percentage change vs. the previous period. */
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  /** Icon-chip colour. */
  tone?: StatTone;
}

export function StatCard({
  label,
  value,
  caption,
  delta,
  deltaLabel = "from last period",
  icon: Icon,
  tone = "blue",
}: StatCardProps) {
  return (
    <Card className="gap-0 p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-tight">{label}</p>
          {caption && (
            <p className="text-muted-foreground mt-0.5 truncate text-sm">{caption}</p>
          )}
        </div>
        <div
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl",
            TONES[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight">{value}</p>

      {typeof delta === "number" && (
        <p
          className={cn(
            "mt-1.5 text-sm font-medium",
            delta > 0 && "text-emerald-600",
            delta < 0 && "text-rose-600",
            delta === 0 && "text-muted-foreground"
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta}% {deltaLabel}
        </p>
      )}
    </Card>
  );
}

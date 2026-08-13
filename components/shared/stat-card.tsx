import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  /** Sub-label under the title, e.g. a date range. */
  caption?: string;
  /** Percentage change vs. the previous period. */
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip, e.g. "bg-blue-50 text-blue-600". */
  tone?: string;
}

export function StatCard({
  label,
  value,
  caption,
  delta,
  deltaLabel = "from last period",
  icon: Icon,
  tone = "bg-blue-50 text-blue-600",
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
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone)}>
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

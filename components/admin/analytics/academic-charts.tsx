"use client";

import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { AverageByLevel, GradeDistributionSlice } from "@/lib/admin/analytics";
import type { Grade } from "@/lib/data/student-results";

const GRADE_COLORS: Record<Grade, string> = {
  A: "#10b981",
  B: "#34d399",
  C: "#3b82f6",
  D: "#f59e0b",
  E: "#f97316",
  U: "#f43f5e",
};

export function AverageByLevelChart({ data }: { data: AverageByLevel[] }) {
  const hasData = data.length > 0;

  return (
    <Card className="gap-0 p-6 lg:col-span-2">
      <h2 className="text-lg font-bold tracking-tight">Average Mark by Level</h2>
      <p className="text-muted-foreground mt-1 text-sm">Current term, across every subject</p>

      {!hasData ? (
        <EmptyState icon={BarChart3} title="No marks saved yet" description="Averages appear once teachers save results for this term." className="h-64" />
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -12, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="level"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={56}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--color-muted-foreground)"
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                formatter={(v: number) => [`${v}%`, "Average"]}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="average" name="Average" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function GradeDistributionChart({ data }: { data: GradeDistributionSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const hasData = data.length > 0 && total > 0;

  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">Grade Distribution</h2>
      <p className="text-muted-foreground mt-1 text-sm">Current term, every subject</p>

      {!hasData ? (
        <EmptyState icon={PieChartIcon} title="No marks saved yet" className="h-56" />
      ) : (
        <>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="grade" innerRadius="58%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
                  {data.map((entry) => (
                    <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, _name, item) => [v, `Grade ${item.payload.grade}`]}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {data.map((entry) => (
              <li key={entry.grade} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: GRADE_COLORS[entry.grade] }} />
                <span>Grade {entry.grade}</span>
                <span className="text-muted-foreground ml-auto shrink-0 tabular-nums">{entry.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

"use client";

import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
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
import type { EnrollmentByLevel, EnrollmentByMonth, StaffBreakdown } from "@/lib/admin/analytics";

const STAFF_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"];

export function EnrollmentByLevelChart({ data }: { data: EnrollmentByLevel[] }) {
  const hasData = data.length > 0;

  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">Enrollment by Level</h2>
      <p className="text-muted-foreground mt-1 text-sm">Students currently registered, by class level</p>

      {!hasData ? (
        <EmptyState icon={BarChart3} title="No students enrolled" className="h-64" />
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
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="students" name="Students" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function EnrollmentTrendChart({ data }: { data: EnrollmentByMonth[] }) {
  const hasData = data.length > 0;

  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">Cumulative Enrollment</h2>
      <p className="text-muted-foreground mt-1 text-sm">Running total of students enrolled this year</p>

      {!hasData ? (
        <EmptyState icon={TrendingUp} title="No enrollments this year" className="h-64" />
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="enrollmentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Students"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                fill="url(#enrollmentFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function StaffBreakdownChart({ data }: { data: StaffBreakdown[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hasData = data.length > 0 && total > 0;

  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">Staff Breakdown</h2>
      <p className="text-muted-foreground mt-1 text-sm">Active admins and teachers, plus pending approvals</p>

      {!hasData ? (
        <EmptyState icon={PieChartIcon} title="No staff yet" className="h-56" />
      ) : (
        <>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={STAFF_COLORS[i % STAFF_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
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
          <ul className="mt-4 space-y-2.5">
            {data.map((entry, i) => (
              <li key={entry.name} className="flex items-center gap-2.5 text-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: STAFF_COLORS[i % STAFF_COLORS.length] }} />
                <span className="truncate">{entry.name}</span>
                <span className="text-muted-foreground ml-auto shrink-0 tabular-nums">{entry.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

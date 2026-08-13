"use client";

import * as React from "react";
import { ChartArea, PieChart as PieChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { revenueByCategory, revenueTrend } from "@/lib/data/finance";
import { formatCurrency } from "@/lib/utils";

type ChartKind = "area" | "bar";

export function RevenueTrendChart() {
  const [kind, setKind] = React.useState<ChartKind>("area");
  const hasData = revenueTrend.length > 0;

  return (
    <Card className="gap-0 p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Billings vs. Collections</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monthly totals across the current academic year
          </p>
        </div>

        <Select
          value={kind}
          onValueChange={(v) => setKind(v as ChartKind)}
          disabled={!hasData}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="area">Area Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasData ? (
        <EmptyState
          icon={ChartArea}
          title="No billing data"
          description="Collections and billings will chart here once invoices exist."
          className="h-72"
        />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "area" ? (
              <AreaChart data={revenueTrend} margin={{ left: -12, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="billedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="billed"
                  name="Billed"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#billedFill)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#collectedFill)"
                />
              </AreaChart>
            ) : (
              <BarChart data={revenueTrend} margin={{ left: -12, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} content={<CurrencyTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="billed" name="Billed" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function RevenueByCategoryChart() {
  const total = revenueByCategory.reduce((sum, d) => sum + d.value, 0);
  const hasData = revenueByCategory.length > 0 && total > 0;

  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">Revenue by Category</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Share of collections this term
      </p>

      {!hasData ? (
        <EmptyState
          icon={PieChartIcon}
          title="No revenue recorded"
          description="Category breakdown appears once payments are collected."
        />
      ) : (
        <>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {revenueByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CurrencyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 space-y-2.5">
            {revenueByCategory.map((entry) => (
              <li key={entry.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="truncate">{entry.name}</span>
                <span className="text-muted-foreground ml-auto shrink-0 tabular-nums">
                  {Math.round((entry.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: { fill?: string };
}

function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover rounded-xl border px-3 py-2 shadow-lg">
      {label && <p className="mb-1.5 text-xs font-semibold">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
          />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">
            {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

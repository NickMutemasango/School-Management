"use client";

import { ChartArea } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { FinanceByTerm } from "@/lib/admin/analytics";
import { formatCurrency } from "@/lib/utils";

export function FinanceByTermChart({ data }: { data: FinanceByTerm[] }) {
  const hasData = data.length > 0;

  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">Billed vs. Collected by Term</h2>
      <p className="text-muted-foreground mt-1 text-sm">Across every invoice issued to date</p>

      {!hasData ? (
        <EmptyState icon={ChartArea} title="No invoices yet" description="Billing totals will chart here once invoices exist." className="h-72" />
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -12, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="term" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--color-muted-foreground)"
                tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="billed" name="Billed" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

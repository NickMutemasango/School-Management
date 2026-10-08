import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  RevenueByCategoryChart,
  RevenueTrendChart,
} from "@/components/admin/finance-charts";
import {
  paymentStatusLabel,
  paymentStatusVariant,
  type CategorySlice,
  type RevenuePoint,
  type Transaction,
} from "@/lib/data/finance";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Finance Overview · Administration",
  description: "Billings, collections, and outstanding fees.",
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export default async function FinanceOverviewPage() {
  const supabase = await createClient();

  const [{ data: invoiceRows }, { data: lineItemRows }, { data: paymentRows }] = await Promise.all([
    supabase.from("invoices").select("id, amount, term, issued_on, voided_at"),
    supabase.from("invoice_line_items").select("invoice_id, category, amount"),
    supabase
      .from("payments")
      .select("id, invoice_id, amount, method, reference, paid_on, students(first_name, last_name)")
      .order("paid_on", { ascending: false }),
  ]);

  const billedInvoices = (invoiceRows ?? []).filter((i) => i.voided_at === null);
  const billedInvoiceIds = new Set(billedInvoices.map((i) => i.id));

  const totalBilled = billedInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

  const validPayments = (paymentRows ?? []).filter((p) => billedInvoiceIds.has(p.invoice_id));
  const totalCollected = validPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const mostRecent = [...billedInvoices].sort((a, b) => (a.issued_on < b.issued_on ? 1 : -1))[0];
  const period = mostRecent
    ? `${mostRecent.term}, ${new Date(mostRecent.issued_on).getFullYear()}`
    : "No invoices issued yet";

  // Billings by month (from issued_on) and collections by month (from
  // paid_on), current calendar year only. Months with no activity are
  // dropped rather than charted as zero, so the chart's own empty state
  // handles "no data yet" instead of a flat zero line.
  const year = new Date().getFullYear();
  const billedByMonth = new Array(12).fill(0);
  const collectedByMonth = new Array(12).fill(0);
  for (const inv of billedInvoices) {
    const d = new Date(inv.issued_on);
    if (d.getFullYear() === year) billedByMonth[d.getMonth()] += Number(inv.amount);
  }
  for (const p of validPayments) {
    const d = new Date(p.paid_on);
    if (d.getFullYear() === year) collectedByMonth[d.getMonth()] += Number(p.amount);
  }
  const revenueTrend: RevenuePoint[] = MONTH_LABELS.map((month, i) => ({
    month,
    billed: Math.round(billedByMonth[i] * 100) / 100,
    collected: Math.round(collectedByMonth[i] * 100) / 100,
  })).filter((p) => p.billed > 0 || p.collected > 0);

  // Revenue by category: each payment is prorated across its invoice's line
  // items by their share of the invoice total, so a partial payment against
  // a multi-line invoice still splits sensibly across categories.
  const lineItemsByInvoice = new Map<string, { category: string; amount: number }[]>();
  for (const l of lineItemRows ?? []) {
    const list = lineItemsByInvoice.get(l.invoice_id) ?? [];
    list.push({ category: l.category, amount: Number(l.amount) });
    lineItemsByInvoice.set(l.invoice_id, list);
  }
  const invoiceAmount = new Map(billedInvoices.map((i) => [i.id, Number(i.amount)]));
  const categoryTotals = new Map<string, number>();
  for (const p of validPayments) {
    const lines = lineItemsByInvoice.get(p.invoice_id);
    const invoiceTotal = invoiceAmount.get(p.invoice_id);
    if (!lines || !invoiceTotal) continue;
    for (const line of lines) {
      const share = (line.amount / invoiceTotal) * Number(p.amount);
      categoryTotals.set(line.category, (categoryTotals.get(line.category) ?? 0) + share);
    }
  }
  const revenueByCategory: CategorySlice[] = Array.from(categoryTotals.entries()).map(
    ([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    })
  );

  const recentTransactions: Transaction[] = validPayments.slice(0, 8).map((row) => {
    const student = (Array.isArray(row.students) ? row.students[0] : row.students) as {
      first_name: string;
      last_name: string;
    } | null;
    return {
      id: row.id,
      reference: row.reference,
      studentName: student ? `${student.last_name}, ${student.first_name}` : "—",
      method: row.method,
      amount: Number(row.amount),
      recordedOn: row.paid_on,
      // A payment only exists here because an admin already recorded it as
      // received - there's no "pending/failed" transaction state to track.
      status: "paid",
    };
  });

  return (
    <>
      <PageHeader
        title="Finance Overview"
        description={period}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/finance/fees">Fee Structure</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="/admin/finance/invoices">
                <Receipt className="size-4" />
                Invoices
              </Link>
            </Button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Billed"
          value={formatCurrency(totalBilled)}
          caption="Invoices issued"
          icon={Receipt}
          tone="blue"
        />
        <StatCard
          label="Collected"
          value={formatCurrency(totalCollected)}
          caption="Payments received"
          icon={Banknote}
          tone="emerald"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          caption="Awaiting settlement"
          icon={PiggyBank}
          tone="rose"
        />
        <StatCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          caption="Collected over billed"
          icon={TrendingUp}
          tone="amber"
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenueTrend} />
        </div>
        <RevenueByCategoryChart data={revenueByCategory} />
      </div>

      {/* Recent transactions */}
      <Card className="mt-8 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-4 border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Recent Transactions</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Latest activity from the cashier desk
            </p>
          </div>
          <Wallet className="text-muted-foreground size-5 shrink-0" />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Reference</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="text-muted-foreground pl-6 font-mono text-xs">
                  {txn.reference}
                </TableCell>
                <TableCell className="font-medium">{txn.studentName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{txn.method}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(txn.recordedOn)}
                </TableCell>
                <TableCell>
                  <Badge variant={paymentStatusVariant[txn.status]}>
                    {paymentStatusLabel[txn.status]}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right font-medium tabular-nums">
                  {formatCurrency(txn.amount)}
                </TableCell>
              </TableRow>
            ))}

            {recentTransactions.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-14 text-center">
                  <p className="font-medium">No transactions recorded</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Payments taken at the cashier desk will appear here.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

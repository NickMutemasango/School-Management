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
  financeSummary,
  paymentStatusLabel,
  paymentStatusVariant,
  recentTransactions,
} from "@/lib/data/finance";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FinanceOverviewPage() {
  return (
    <>
      <PageHeader
        title="Finance Overview"
        description={financeSummary.period}
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
          value={formatCurrency(financeSummary.totalBilled)}
          caption="Invoices issued this term"
          icon={Receipt}
          tone="bg-blue-50 text-blue-600"
          delta={financeSummary.billedDelta}
        />
        <StatCard
          label="Collected"
          value={formatCurrency(financeSummary.totalCollected)}
          caption="Payments received"
          icon={Banknote}
          tone="bg-emerald-50 text-emerald-600"
          delta={financeSummary.collectedDelta}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(financeSummary.outstanding)}
          caption="Awaiting settlement"
          icon={PiggyBank}
          tone="bg-rose-50 text-rose-600"
          delta={financeSummary.outstandingDelta}
        />
        <StatCard
          label="Collection Rate"
          value={`${financeSummary.collectionRate}%`}
          caption="Collected over billed"
          icon={TrendingUp}
          tone="bg-amber-50 text-amber-600"
          delta={financeSummary.rateDelta}
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <RevenueByCategoryChart />
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

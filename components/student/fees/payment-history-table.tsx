import { Banknote } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { paymentStatusLabel, paymentStatusVariant } from "@/lib/data/finance";
import type { FeePayment } from "@/lib/data/student-fees";

export function PaymentHistoryTable({ payments }: { payments: FeePayment[] }) {
  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <section>
      <h2 className="mb-4 font-bold tracking-tight">Payment History</h2>

      <div className="bg-background overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
        {payments.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No payments recorded"
            description="Payments made towards your fees will be listed here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-6 font-mono text-xs">
                    {payment.reference}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {formatDate(payment.paidOn)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payment.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentStatusVariant[payment.status]}>
                      {paymentStatusLabel[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right font-medium tabular-nums">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {payments.length > 0 && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {payments.length} payment{payments.length === 1 ? "" : "s"} totalling{" "}
          <span className="font-medium text-emerald-600">
            {formatCurrency(total)}
          </span>
        </p>
      )}
    </section>
  );
}

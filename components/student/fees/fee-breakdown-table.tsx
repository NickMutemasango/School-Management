import { Receipt } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import type { FeeCharge } from "@/lib/data/student-fees";

export function FeeBreakdownTable({ charges }: { charges: FeeCharge[] }) {
  const total = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <section>
      <h2 className="mb-4 font-bold tracking-tight">Fee Breakdown</h2>

      <div className="bg-background overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
        {charges.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No charges yet"
            description="Your term's fee breakdown will appear here once it's issued."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Item</TableHead>
                <TableHead className="pr-6 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {charges.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell className="pl-6 whitespace-normal">
                    <p className="font-medium">{charge.category}</p>
                    {charge.description && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {charge.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right font-medium tabular-nums">
                    {formatCurrency(charge.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell className="pl-6 font-semibold">Total billed</TableCell>
                <TableCell className="pr-6 text-right font-bold tabular-nums">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </section>
  );
}

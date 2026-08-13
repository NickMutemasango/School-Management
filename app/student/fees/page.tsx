import type { Metadata } from "next";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { FeeSummary } from "@/components/student/fees/fee-summary";
import { FeeBreakdownTable } from "@/components/student/fees/fee-breakdown-table";
import { PaymentHistoryTable } from "@/components/student/fees/payment-history-table";
import { feeStatement } from "@/lib/data/student-fees";

export const metadata: Metadata = {
  title: "Fees — Student Portal",
  description: "Your fee statement, balance, and payment history.",
};

export default function StudentFeesPage() {
  return (
    <>
      <PageHeader
        title="Fees"
        description={
          feeStatement.term
            ? `Statement for ${feeStatement.term}.`
            : "Your fee statement, balance, and payment history."
        }
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            <Download className="size-4" />
            Download statement
          </button>
        }
      />

      <div className="space-y-8">
        <FeeSummary statement={feeStatement} />
        <FeeBreakdownTable charges={feeStatement.charges} />
        <PaymentHistoryTable payments={feeStatement.payments} />
      </div>
    </>
  );
}

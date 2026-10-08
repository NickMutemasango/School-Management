import type { Metadata } from "next";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { FeeSummary } from "@/components/student/fees/fee-summary";
import { FeeBreakdownTable } from "@/components/student/fees/fee-breakdown-table";
import { PaymentHistoryTable } from "@/components/student/fees/payment-history-table";
import { getCurrentStudentRow } from "@/lib/students/current-student";
import { createClient } from "@/lib/supabase/server";
import type { FeeStatement } from "@/lib/data/student-fees";

export const metadata: Metadata = {
  title: "Fees · Student Portal",
  description: "Your fee statement, balance, and payment history.",
};

const EMPTY_STATEMENT: FeeStatement = {
  term: "",
  totalBilled: 0,
  totalPaid: 0,
  outstanding: 0,
  dueOn: "",
  charges: [],
  payments: [],
};

export default async function StudentFeesPage() {
  const student = await getCurrentStudentRow();
  const feeStatement = student ? await loadFeeStatement(student.id) : EMPTY_STATEMENT;

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

async function loadFeeStatement(studentId: string): Promise<FeeStatement> {
  const supabase = await createClient();

  const { data: invoiceRows } = await supabase
    .from("invoices")
    .select("id, term, issued_on, due_on, amount, voided_at")
    .eq("student_id", studentId)
    .order("issued_on", { ascending: false });

  const invoices = (invoiceRows ?? []).filter((i) => i.voided_at === null);
  if (invoices.length === 0) return EMPTY_STATEMENT;

  const invoiceIds = invoices.map((i) => i.id);

  const [{ data: lineItemRows }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("invoice_line_items")
      .select("id, category, description, amount")
      .in("invoice_id", invoiceIds),
    supabase
      .from("payments")
      .select("id, invoice_id, reference, method, amount, paid_on")
      .in("invoice_id", invoiceIds)
      .order("paid_on", { ascending: false }),
  ]);

  const paidByInvoice = new Map<string, number>();
  for (const p of paymentRows ?? []) {
    paidByInvoice.set(p.invoice_id, (paidByInvoice.get(p.invoice_id) ?? 0) + Number(p.amount));
  }

  const totalBilled = invoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPaid = (paymentRows ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  // Due date for the oldest invoice that still has a balance outstanding -
  // once every invoice is settled there's nothing to show a due date for.
  const unpaid = [...invoices]
    .filter((i) => (paidByInvoice.get(i.id) ?? 0) < Number(i.amount))
    .sort((a, b) => (a.due_on < b.due_on ? -1 : 1));
  const dueOn = unpaid[0]?.due_on ?? "";

  return {
    term: `${invoices[0].term}, ${new Date(invoices[0].issued_on).getFullYear()}`,
    totalBilled,
    totalPaid,
    outstanding: totalBilled - totalPaid,
    dueOn,
    charges: (lineItemRows ?? []).map((l) => ({
      id: l.id,
      category: l.category,
      description: l.description,
      amount: Number(l.amount),
    })),
    payments: (paymentRows ?? []).map((p) => ({
      id: p.id,
      reference: p.reference,
      paidOn: p.paid_on,
      method: p.method,
      amount: Number(p.amount),
      // Recorded by the cashier desk only once actually received - there's
      // no "pending/failed" payment state to track.
      status: "paid",
    })),
  };
}

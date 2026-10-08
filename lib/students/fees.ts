import { createClient } from "@/lib/supabase/server";
import type { FeeStatement } from "@/lib/data/student-fees";

export const EMPTY_FEE_STATEMENT: FeeStatement = {
  term: "",
  totalBilled: 0,
  totalPaid: 0,
  outstanding: 0,
  dueOn: "",
  charges: [],
  payments: [],
};

/**
 * A student's fee statement, scoped by RLS to whoever's asking - the
 * student themself (invoices_select_own) or a linked parent
 * (invoices_select_parent, migration 0024). Shared by
 * app/student/fees/page.tsx and app/parent/fees/page.tsx so the billed/
 * paid/outstanding math can't drift between the two.
 */
export async function getFeeStatement(studentId: string): Promise<FeeStatement> {
  const supabase = await createClient();

  const { data: invoiceRows } = await supabase
    .from("invoices")
    .select("id, term, issued_on, due_on, amount, voided_at")
    .eq("student_id", studentId)
    .order("issued_on", { ascending: false });

  const invoices = (invoiceRows ?? []).filter((i) => i.voided_at === null);
  if (invoices.length === 0) return EMPTY_FEE_STATEMENT;

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

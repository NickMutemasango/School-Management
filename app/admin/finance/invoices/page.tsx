import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { InvoiceTable } from "@/components/admin/invoice-table";
import { createClient } from "@/lib/supabase/server";
import type { Invoice, FeeLine, PaymentStatus } from "@/lib/data/finance";
import type { Student } from "@/lib/data/students";
import { avatarColorFor } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Invoices · Administration",
  description: "Issue, track, and reconcile student fee invoices.",
};

function statusFor(amount: number, amountPaid: number, dueOn: string, voided: boolean): PaymentStatus {
  if (voided) return "voided";
  if (amountPaid >= amount) return "paid";
  if (amountPaid > 0) return "partial";
  return dueOn < new Date().toISOString().slice(0, 10) ? "overdue" : "pending";
}

export default async function InvoicesPage() {
  const supabase = await createClient();

  const [{ data: invoiceRows }, { data: paymentRows }, { data: studentRows }, { data: feeLineRows }] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("id, student_id, invoice_number, term, issued_on, due_on, amount, voided_at, students(first_name, last_name, reg_number, class_level)")
        .order("issued_on", { ascending: false }),
      supabase.from("payments").select("invoice_id, amount, method, paid_on"),
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("fee_structure_lines").select("*").order("created_at", { ascending: true }),
    ]);

  const paidByInvoice = new Map<string, number>();
  const latestMethodByInvoice = new Map<string, { method: string; paidOn: string }>();
  for (const p of paymentRows ?? []) {
    paidByInvoice.set(p.invoice_id, (paidByInvoice.get(p.invoice_id) ?? 0) + Number(p.amount));
    const existing = latestMethodByInvoice.get(p.invoice_id);
    if (!existing || p.paid_on > existing.paidOn) {
      latestMethodByInvoice.set(p.invoice_id, { method: p.method, paidOn: p.paid_on });
    }
  }

  const invoices: Invoice[] = (invoiceRows ?? []).map((row) => {
    // Supabase's generated types treat a to-one FK join as an array - this
    // relationship is 1:1 (invoices.student_id -> students.id), so there's
    // always exactly one row.
    const student = (Array.isArray(row.students) ? row.students[0] : row.students) as {
      first_name: string;
      last_name: string;
      reg_number: string;
      class_level: string;
    } | null;
    const amount = Number(row.amount);
    const amountPaid = paidByInvoice.get(row.id) ?? 0;
    return {
      id: row.id,
      invoiceNumber: row.invoice_number,
      studentId: row.student_id,
      studentName: student ? `${student.last_name}, ${student.first_name}` : "—",
      regNumber: student?.reg_number ?? "—",
      classLevel: student?.class_level ?? "—",
      term: row.term,
      issuedOn: row.issued_on,
      dueOn: row.due_on,
      amount,
      amountPaid,
      status: statusFor(amount, amountPaid, row.due_on, row.voided_at !== null),
      method: (latestMethodByInvoice.get(row.id)?.method as Invoice["method"]) ?? "—",
    };
  });

  const students: Student[] = (studentRows ?? []).map((row) => ({
    id: row.id,
    regNumber: row.reg_number,
    firstName: row.first_name,
    lastName: row.last_name,
    classLevel: row.class_level,
    status: row.status,
    gender: row.gender,
    dateOfBirth: row.date_of_birth ?? "",
    enrolledOn: row.enrolled_on,
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    guardianEmail: row.guardian_email,
    address: row.address,
    feeBalance: Number(row.fee_balance),
    attendanceRate: Number(row.attendance_rate),
    avatarColor: avatarColorFor(row.id),
  }));

  const feeStructure: FeeLine[] = (feeLineRows ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    description: row.description,
    ecd: Number(row.ecd_amount),
    primary: Number(row.primary_amount),
    secondary: Number(row.secondary_amount),
    aLevel: Number(row.a_level_amount),
  }));

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Issue, track, and reconcile student fee invoices."
      />
      <InvoiceTable invoices={invoices} students={students} feeStructure={feeStructure} />
    </>
  );
}

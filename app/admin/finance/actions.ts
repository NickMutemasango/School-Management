"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveAdmin } from "@/lib/auth/require-active-admin";
import type { PaymentMethod } from "@/lib/data/finance";

/** Postgres unique-violation error code. */
const UNIQUE_VIOLATION = "23505";

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "EcoCash",
  "Bank Transfer",
  "Cash",
  "Card",
];

function parseAmount(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export interface CreateFeeLineState {
  error: string | null;
}

/**
 * fee_structure_lines has no insert/update/delete RLS policies (see
 * migration 0020) - all mutations go through this service-role client,
 * gated by requireActiveAdmin(), same convention as classes/levels.
 */
export async function createFeeLine(
  _prev: CreateFeeLineState,
  formData: FormData
): Promise<CreateFeeLineState> {
  const { schoolId } = await requireActiveAdmin();

  const category = String(formData.get("category") ?? "").trim();
  if (!category) return { error: "Enter a fee category." };

  const admin = createAdminClient();
  const { error } = await admin.from("fee_structure_lines").insert({
    school_id: schoolId,
    category,
    description: String(formData.get("description") ?? "").trim(),
    ecd_amount: parseAmount(formData.get("ecdAmount")),
    primary_amount: parseAmount(formData.get("primaryAmount")),
    secondary_amount: parseAmount(formData.get("secondaryAmount")),
    a_level_amount: parseAmount(formData.get("aLevelAmount")),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/finance/fees");
  revalidatePath("/admin/finance/invoices");
  return { error: null };
}

export async function deleteFeeLine(feeLineId: string) {
  const { schoolId } = await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("fee_structure_lines")
    .delete()
    .eq("id", feeLineId)
    .eq("school_id", schoolId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/finance/fees");
  revalidatePath("/admin/finance/invoices");
}

export interface InvoiceLineInput {
  category: string;
  description: string;
  amount: number;
}

export interface CreateInvoiceState {
  error: string | null;
}

/**
 * Invoices are never created directly by a student/teacher, so there's no
 * RLS insert policy to lean on - this generates a per-school sequential
 * invoice number and writes the invoice + its line items with the
 * service-role client. invoice_number collisions (another admin issuing at
 * the same instant) are resolved by retrying with the next number rather
 * than failing the whole submission.
 */
export async function createInvoice(
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const { schoolId } = await requireActiveAdmin();

  const studentId = String(formData.get("studentId") ?? "");
  const term = String(formData.get("term") ?? "").trim();
  const issuedOn = String(formData.get("issuedOn") ?? "");
  const dueOn = String(formData.get("dueOn") ?? "");
  const linesRaw = String(formData.get("lines") ?? "[]");

  if (!studentId) return { error: "Select a student." };
  if (!term) return { error: "Select a term." };
  if (!issuedOn || !dueOn) return { error: "Set an issue date and a due date." };

  let lines: InvoiceLineInput[];
  try {
    lines = JSON.parse(linesRaw);
  } catch {
    return { error: "Invalid line items." };
  }

  const cleanLines = lines
    .map((l) => ({
      category: String(l.category ?? "").trim(),
      description: String(l.description ?? "").trim(),
      amount: Number(l.amount) || 0,
    }))
    .filter((l) => l.category && l.amount > 0);

  if (cleanLines.length === 0) {
    return { error: "Add at least one line item with a category and amount." };
  }

  const admin = createAdminClient();
  const amount = cleanLines.reduce((sum, l) => sum + l.amount, 0);
  const year = new Date(issuedOn).getFullYear();

  const { count } = await admin
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .gte("issued_on", `${year}-01-01`)
    .lte("issued_on", `${year}-12-31`);

  let sequence = (count ?? 0) + 1;
  let invoice: { id: string } | null = null;

  for (let attempt = 0; attempt < 5 && !invoice; attempt++) {
    const invoiceNumber = `INV-${year}-${String(sequence).padStart(4, "0")}`;
    const { data, error } = await admin
      .from("invoices")
      .insert({
        school_id: schoolId,
        student_id: studentId,
        invoice_number: invoiceNumber,
        term,
        issued_on: issuedOn,
        due_on: dueOn,
        amount,
      })
      .select("id")
      .single();

    if (!error) {
      invoice = data;
      break;
    }
    if (error.code !== UNIQUE_VIOLATION) {
      return { error: error.message };
    }
    sequence += 1;
  }

  if (!invoice) return { error: "Could not generate a unique invoice number. Try again." };

  const { error: lineError } = await admin.from("invoice_line_items").insert(
    cleanLines.map((l) => ({
      invoice_id: invoice!.id,
      category: l.category,
      description: l.description,
      amount: l.amount,
    }))
  );

  if (lineError) {
    // Line items are the invoice's content - without them it's a billed
    // amount with nothing behind it, so an invoice that can't get its lines
    // written shouldn't be left on the books either.
    await admin.from("invoices").delete().eq("id", invoice.id);
    return { error: lineError.message };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/invoices");
  revalidatePath("/student/fees");
  return { error: null };
}

export async function voidInvoice(invoiceId: string) {
  const { schoolId } = await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("invoices")
    .update({ voided_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("school_id", schoolId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/invoices");
  revalidatePath("/student/fees");
}

/** Reverses an accidental void - the invoice and its line items/payments were
 * never deleted, so clearing voided_at is enough to bring it back. */
export async function unvoidInvoice(invoiceId: string) {
  const { schoolId } = await requireActiveAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("invoices")
    .update({ voided_at: null })
    .eq("id", invoiceId)
    .eq("school_id", schoolId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/invoices");
  revalidatePath("/student/fees");
}

export interface RecordPaymentState {
  error: string | null;
}

export async function recordPayment(
  _prev: RecordPaymentState,
  formData: FormData
): Promise<RecordPaymentState> {
  const { schoolId, adminId } = await requireActiveAdmin();

  const invoiceId = String(formData.get("invoiceId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const method = String(formData.get("method") ?? "");
  const amount = Number(formData.get("amount"));
  const paidOn = String(formData.get("paidOn") ?? "");

  if (!invoiceId || !studentId) return { error: "Missing invoice." };
  if (!PAYMENT_METHODS.includes(method as PaymentMethod)) {
    return { error: "Select a payment method." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }
  if (!paidOn) return { error: "Set the payment date." };

  const admin = createAdminClient();
  const reference = `PMT-${Date.now().toString(36).toUpperCase()}`;

  const { error } = await admin.from("payments").insert({
    school_id: schoolId,
    invoice_id: invoiceId,
    student_id: studentId,
    reference,
    method,
    amount,
    paid_on: paidOn,
    recorded_by: adminId,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/invoices");
  revalidatePath("/student/fees");
  return { error: null };
}

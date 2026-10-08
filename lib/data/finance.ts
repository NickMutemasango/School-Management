/**
 * Finance data contract.
 *
 * Types, enums, and display mappings only — there are no records here yet.
 * Replace the empty exports with backend queries; keep the types as the
 * contract so the invoice table, charts, and fee breakdown keep compiling.
 */

export type PaymentStatus = "paid" | "partial" | "pending" | "overdue" | "voided";

export type PaymentMethod =
  | "EcoCash"
  | "Bank Transfer"
  | "Cash"
  | "Card"
  | "—";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  regNumber: string;
  classLevel: string;
  term: string;
  issuedOn: string;
  dueOn: string;
  amount: number;
  amountPaid: number;
  status: PaymentStatus;
  method: PaymentMethod;
}

export const invoices: Invoice[] = [];

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  pending: "Pending",
  overdue: "Overdue",
  voided: "Voided",
};

export const paymentStatusVariant: Record<
  PaymentStatus,
  "success" | "info" | "warning" | "danger" | "neutral"
> = {
  paid: "success",
  partial: "info",
  pending: "warning",
  overdue: "danger",
  voided: "neutral",
};

/** One row of the fee structure, priced per class band. */
export interface FeeLine {
  id: string;
  category: string;
  description: string;
  ecd: number;
  primary: number;
  secondary: number;
  aLevel: number;
}

export const feeStructure: FeeLine[] = [];

/** Which fee-structure column a class level bills against. */
export function feeBandForLevel(level: string): keyof Pick<FeeLine, "ecd" | "primary" | "secondary" | "aLevel"> {
  if (level.startsWith("ECD")) return "ecd";
  if (level.startsWith("GRADE")) return "primary";
  if (level === "FORM 5" || level === "FORM 6") return "aLevel";
  return "secondary";
}

export interface FinanceSummary {
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  collectionRate: number;
  /**
   * Percentage change vs. the previous period. Optional: there's no
   * previous-period baseline to compare against yet, so real data omits
   * these rather than fabricate a "0% from last period" claim.
   */
  billedDelta?: number;
  collectedDelta?: number;
  outstandingDelta?: number;
  rateDelta?: number;
  /** Human-readable reporting period, e.g. "Term 2, 2026". */
  period: string;
}

/** Top-line KPIs for the finance dashboard summary cards. */
export const financeSummary: FinanceSummary = {
  totalBilled: 0,
  totalCollected: 0,
  outstanding: 0,
  collectionRate: 0,
  billedDelta: 0,
  collectedDelta: 0,
  outstandingDelta: 0,
  rateDelta: 0,
  period: "No reporting period selected",
};

export interface RevenuePoint {
  month: string;
  billed: number;
  collected: number;
}

/** Collections vs. billings trend — feeds the area/bar chart. */
export const revenueTrend: RevenuePoint[] = [];

export interface CategorySlice {
  name: string;
  value: number;
  /** CSS colour for the slice, e.g. "var(--color-chart-1)". */
  fill: string;
}

/** Revenue split by fee category — feeds the donut chart. */
export const revenueByCategory: CategorySlice[] = [];

export interface Transaction {
  id: string;
  reference: string;
  studentName: string;
  method: PaymentMethod;
  amount: number;
  recordedOn: string;
  status: PaymentStatus;
}

/** Recent cashier activity shown on the finance overview. */
export const recentTransactions: Transaction[] = [];

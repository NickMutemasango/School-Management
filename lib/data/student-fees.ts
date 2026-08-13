/**
 * Student fee statement data contract.
 *
 * Payment status and method vocabulary is reused from the finance module so
 * the student statement and the admin invoice list can't drift apart.
 */

import type { PaymentMethod, PaymentStatus } from "./finance";

export type { PaymentMethod, PaymentStatus };

/** A single line on the term's fee invoice. */
export interface FeeCharge {
  id: string;
  category: string;
  description: string;
  amount: number;
}

/** A payment the student (or guardian) has made. */
export interface FeePayment {
  id: string;
  reference: string;
  paidOn: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
}

export interface FeeStatement {
  /** Reporting period, e.g. "Term 2, 2026". */
  term: string;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  /** Due date for the outstanding balance. */
  dueOn: string;
  charges: FeeCharge[];
  payments: FeePayment[];
}

/** The signed-in student's statement. Empty until a backend is connected. */
export const feeStatement: FeeStatement = {
  term: "",
  totalBilled: 0,
  totalPaid: 0,
  outstanding: 0,
  dueOn: "",
  charges: [],
  payments: [],
};

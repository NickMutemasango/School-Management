"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Banknote, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateSelectField } from "@/components/shared/date-select-field";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/lib/data/finance";
import { recordPayment, type RecordPaymentState } from "@/app/admin/finance/actions";

const PAYMENT_METHODS = ["EcoCash", "Bank Transfer", "Cash", "Card"] as const;

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ invoice, onOpenChange }: RecordPaymentDialogProps) {
  const open = invoice !== null;
  // Remounts on each open so a previous attempt's error/pending state
  // doesn't leak into the next invoice - same convention as
  // create-invoice-dialog.tsx.
  const [instance, setInstance] = React.useState(0);
  React.useEffect(() => {
    if (open) setInstance((n) => n + 1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {invoice && (
        <PaymentForm key={instance} invoice={invoice} onOpenChange={onOpenChange} />
      )}
    </Dialog>
  );
}

const initialState: RecordPaymentState = { error: null };

function PaymentForm({
  invoice,
  onOpenChange,
}: {
  invoice: Invoice;
  onOpenChange: (open: boolean) => void;
}) {
  const balance = invoice.amount - invoice.amountPaid;
  const [method, setMethod] = React.useState("");
  const [amount, setAmount] = React.useState(balance > 0 ? String(balance) : "");
  const [paidOn, setPaidOn] = React.useState(new Date().toISOString().slice(0, 10));
  const [state, formAction, isPending] = useActionState(recordPayment, initialState);
  const submittedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isPending && submittedRef.current && !state.error) {
      submittedRef.current = false;
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, state.error]);

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogDescription>
          {invoice.invoiceNumber} · {invoice.studentName} · balance{" "}
          {formatCurrency(balance)}
        </DialogDescription>
      </DialogHeader>

      <form
        action={formAction}
        onSubmit={() => {
          submittedRef.current = true;
        }}
        className="space-y-4"
      >
        <input type="hidden" name="invoiceId" value={invoice.id} />
        <input type="hidden" name="studentId" value={invoice.studentId} />

        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="method">Method</Label>
          <Select name="method" value={method} onValueChange={setMethod} required>
            <SelectTrigger id="method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DateSelectField
          id="paidOn"
          label="Date"
          name="paidOn"
          value={paidOn}
          onChange={setPaidOn}
          maxYear={new Date().getFullYear()}
        />

        {state.error && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" disabled={isPending || !method}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />}
            Record Payment
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

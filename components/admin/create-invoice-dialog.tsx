"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DateSelectField } from "@/components/shared/date-select-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feeBandForLevel, type FeeLine } from "@/lib/data/finance";
import type { Student } from "@/lib/data/students";
import { formatCurrency } from "@/lib/utils";
import {
  createInvoice,
  type CreateInvoiceState,
} from "@/app/admin/finance/actions";

interface LineItem {
  id: number;
  category: string;
  description: string;
  amount: number;
}

export function CreateInvoiceDialog({
  students,
  feeStructure,
  children,
}: {
  students: Student[];
  feeStructure: FeeLine[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  // Remounts the form each time the dialog opens, so a previous attempt's
  // error/pending state (held by useActionState, which has no external
  // reset) can't leak into the next one - same convention as
  // components/student/assignments/submission-dialog.tsx.
  const [instance, setInstance] = React.useState(0);
  React.useEffect(() => {
    if (open) setInstance((n) => n + 1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="accent">
            <Plus className="size-4" />
            Create Invoice
          </Button>
        )}
      </DialogTrigger>

      <InvoiceForm
        key={instance}
        students={students}
        feeStructure={feeStructure}
        onOpenChange={setOpen}
      />
    </Dialog>
  );
}

const initialState: CreateInvoiceState = { error: null };

function InvoiceForm({
  students,
  feeStructure,
  onOpenChange,
}: {
  students: Student[];
  feeStructure: FeeLine[];
  onOpenChange: (open: boolean) => void;
}) {
  const [studentId, setStudentId] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [issuedOn, setIssuedOn] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueOn, setDueOn] = React.useState("");
  const [lines, setLines] = React.useState<LineItem[]>([]);
  const [state, formAction, isPending] = useActionState(
    createInvoice,
    initialState,
  );
  const submittedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isPending && submittedRef.current && !state.error) {
      submittedRef.current = false;
      onOpenChange(false);
    }
    // Only re-check when a submission attempt finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, state.error]);

  const subtotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);
  const selectedStudent = students.find((s) => s.id === studentId);
  const band = selectedStudent
    ? feeBandForLevel(selectedStudent.classLevel)
    : null;

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((l) => l.id)) + 1,
        category: "",
        description: "",
        amount: 0,
      },
    ]);
  }

  function updateLine(id: number, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLine(id: number) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogDescription>
          Bill a student for the selected term. Line items are priced from the
          fee structure.
        </DialogDescription>
      </DialogHeader>

      <Separator />

      <form
        action={formAction}
        onSubmit={() => {
          submittedRef.current = true;
        }}
        className="space-y-4"
      >
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="term" value={term} />
        <input
          type="hidden"
          name="lines"
          value={JSON.stringify(
            lines.map(({ category, description, amount }) => ({
              category,
              description,
              amount,
            })),
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={studentId}
              onValueChange={setStudentId}
              disabled={students.length === 0}
            >
              <SelectTrigger id="student">
                <SelectValue
                  placeholder={
                    students.length === 0
                      ? "No students available"
                      : "Select student"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.lastName}, {s.firstName} ({s.regNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="term">Term</Label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger id="term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DateSelectField
            id="issuedOn"
            name="issuedOn"
            label="Issue Date"
            value={issuedOn}
            onChange={setIssuedOn}
            minYear={new Date().getFullYear() - 1}
            maxYear={new Date().getFullYear()}
          />

          <DateSelectField
            id="dueOn"
            name="dueOn"
            label="Due Date"
            value={dueOn}
            onChange={setDueOn}
            minYear={new Date().getFullYear()}
            maxYear={new Date().getFullYear() + 1}
          />
        </div>

        <Separator />

        {/* Line items */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Line Items</h3>
            <Button type="button" variant="ghost" size="sm" onClick={addLine}>
              <Plus className="size-4" />
              Add line
            </Button>
          </div>

          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.id} className="flex gap-2">
                <Select
                  value={line.category || undefined}
                  onValueChange={(v) => {
                    const fee = feeStructure.find((f) => f.category === v);
                    updateLine(line.id, {
                      category: v,
                      description: fee?.description ?? "",
                      amount: fee && band ? fee[band] : line.amount,
                    });
                  }}
                  disabled={feeStructure.length === 0}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue
                      placeholder={
                        feeStructure.length === 0
                          ? "No fee categories defined"
                          : "Select fee category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {feeStructure.map((f) => (
                      <SelectItem key={f.id} value={f.category}>
                        {f.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={line.amount || ""}
                  onChange={(e) =>
                    updateLine(line.id, { amount: Number(e.target.value) })
                  }
                  placeholder="0.00"
                  className="w-32 text-right"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove line"
                  onClick={() => removeLine(line.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {lines.length === 0 && (
              <p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
                No line items yet.
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium">Invoice Total</span>
            <span className="text-lg font-bold tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        {state.error && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            disabled={
              isPending || !studentId || !term || !dueOn || lines.length === 0
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Issue Invoice
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

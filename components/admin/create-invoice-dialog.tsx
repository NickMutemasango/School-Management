"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feeStructure } from "@/lib/data/finance";
import { students } from "@/lib/data/students";
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  id: number;
  description: string;
  amount: number;
}

export function CreateInvoiceDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [lines, setLines] = React.useState<LineItem[]>([]);

  const subtotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  function addLine() {
    setLines((prev) => [
      ...prev,
      { id: Math.max(0, ...prev.map((l) => l.id)) + 1, description: "", amount: 0 },
    ]);
  }

  function updateLine(id: number, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLine(id: number) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

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

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Bill a student for the selected term. Line items are priced from the
            fee structure.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="student">Student</Label>
            <Select disabled={students.length === 0}>
              <SelectTrigger id="student">
                <SelectValue
                  placeholder={
                    students.length === 0 ? "No students available" : "Select student"
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
            <Select>
              <SelectTrigger id="term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term-1">Term 1</SelectItem>
                <SelectItem value="term-2">Term 2</SelectItem>
                <SelectItem value="term-3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issuedOn">Issue Date</Label>
            <Input id="issuedOn" type="date" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueOn">Due Date</Label>
            <Input id="dueOn" type="date" />
          </div>
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
                  value={line.description || undefined}
                  onValueChange={(v) => {
                    const fee = feeStructure.find((f) => f.category === v);
                    updateLine(line.id, {
                      description: v,
                      amount: fee?.secondary ?? line.amount,
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="accent" onClick={() => setOpen(false)}>
            Issue Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

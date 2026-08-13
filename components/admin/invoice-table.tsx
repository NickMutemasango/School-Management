"use client";

import * as React from "react";
import { Download, MoreHorizontal, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import {
  invoices,
  paymentStatusLabel,
  paymentStatusVariant,
  type PaymentStatus,
} from "@/lib/data/finance";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: PaymentStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export function InvoiceTable() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<PaymentStatus | "all">("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesQuery =
        !q ||
        inv.studentName.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.regNumber.toLowerCase().includes(q);
      const matchesStatus = status === "all" || inv.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const totals = React.useMemo(
    () => ({
      billed: filtered.reduce((s, i) => s + i.amount, 0),
      paid: filtered.reduce((s, i) => s + i.amountPaid, 0),
    }),
    [filtered]
  );

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by invoice number, student, or reg number"
            className="pl-11"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as PaymentStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="shrink-0">
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <CreateInvoiceDialog />
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Invoice</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((inv) => {
              const balance = inv.amount - inv.amountPaid;
              return (
                <TableRow key={inv.id}>
                  <TableCell className="pl-6">
                    <p className="font-mono text-xs font-medium">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-muted-foreground text-xs">{inv.term}</p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium">{inv.studentName}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {inv.regNumber}
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{inv.classLevel}</Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.dueOn)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={paymentStatusVariant[inv.status]}>
                      {paymentStatusLabel[inv.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(inv.amount)}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      balance > 0 ? "text-rose-600" : "text-emerald-600"
                    )}
                  >
                    {formatCurrency(balance)}
                  </TableCell>

                  <TableCell className="pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Actions for ${inv.invoiceNumber}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View invoice</DropdownMenuItem>
                        <DropdownMenuItem>Record payment</DropdownMenuItem>
                        <DropdownMenuItem>Send reminder</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Void invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-16 text-center">
                  <p className="font-medium">
                    {invoices.length === 0
                      ? "No invoices yet"
                      : "No invoices found"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {invoices.length === 0
                      ? "Create an invoice to start billing students."
                      : "Adjust your search or status filter."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span>
          Showing {filtered.length} of {invoices.length} invoices
        </span>
        <span>
          Billed:{" "}
          <span className="text-foreground font-medium tabular-nums">
            {formatCurrency(totals.billed)}
          </span>
        </span>
        <span>
          Collected:{" "}
          <span className="font-medium tabular-nums text-emerald-600">
            {formatCurrency(totals.paid)}
          </span>
        </span>
      </div>
    </>
  );
}

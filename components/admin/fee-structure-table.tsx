"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FeeLine } from "@/lib/data/finance";
import { createFeeLine, deleteFeeLine, type CreateFeeLineState } from "@/app/admin/finance/actions";
import { formatCurrency } from "@/lib/utils";

const BANDS = [
  { key: "ecd", label: "ECD" },
  { key: "primary", label: "Grade 1 to 7" },
  { key: "secondary", label: "Form 1 to 4" },
  { key: "aLevel", label: "Form 5 to 6" },
] as const;

const FIELD_BY_BAND: Record<(typeof BANDS)[number]["key"], string> = {
  ecd: "ecdAmount",
  primary: "primaryAmount",
  secondary: "secondaryAmount",
  aLevel: "aLevelAmount",
};

export function FeeStructureTable({ feeStructure }: { feeStructure: FeeLine[] }) {
  const [isPending, startTransition] = React.useTransition();
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const totals = BANDS.reduce(
    (acc, band) => {
      acc[band.key] = feeStructure.reduce((sum, line) => sum + line[band.key], 0);
      return acc;
    },
    {} as Record<(typeof BANDS)[number]["key"], number>
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteFeeLine(id);
        setDeleteError(null);
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      {/* Per-band totals */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BANDS.map((band) => (
          <Card key={band.key} className="gap-0 p-5">
            <p className="text-muted-foreground text-sm">{band.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
              {formatCurrency(totals[band.key])}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">per term, all-inclusive</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Fee Category</TableHead>
              {BANDS.map((band) => (
                <TableHead key={band.key} className="text-right">
                  {band.label}
                </TableHead>
              ))}
              <TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {feeStructure.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="pl-6 whitespace-normal">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{line.category}</p>
                    {line.category.includes("Optional") && (
                      <Badge variant="neutral">Optional</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {line.description}
                  </p>
                </TableCell>

                {BANDS.map((band) => (
                  <TableCell key={band.key} className="text-right tabular-nums">
                    {line[band.key] === 0 ? (
                      <span className="text-muted-foreground">&mdash;</span>
                    ) : (
                      formatCurrency(line[band.key])
                    )}
                  </TableCell>
                ))}

                <TableCell className="pr-6">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${line.category}`}
                    disabled={isPending}
                    onClick={() => handleDelete(line.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {feeStructure.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={BANDS.length + 2} className="py-14 text-center">
                  <p className="font-medium">No fee lines defined</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Add a fee line below to build the per-term structure.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {feeStructure.length > 0 && (
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell className="pl-6 font-semibold">Total per term</TableCell>
                {BANDS.map((band) => (
                  <TableCell
                    key={band.key}
                    className="text-right font-bold tabular-nums"
                  >
                    {formatCurrency(totals[band.key])}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>

      {deleteError && (
        <p className="mb-4 text-sm font-medium text-destructive">{deleteError}</p>
      )}

      <AddFeeLineCard />
    </>
  );
}

const initialState: CreateFeeLineState = { error: null };

function AddFeeLineCard() {
  const [state, formAction, isPending] = useActionState(createFeeLine, initialState);

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-sm font-semibold">Add Fee Line</h3>
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="Tuition" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Per-term tuition fee" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {BANDS.map((band) => (
            <div key={band.key} className="grid gap-2">
              <Label htmlFor={FIELD_BY_BAND[band.key]}>{band.label}</Label>
              <Input
                id={FIELD_BY_BAND[band.key]}
                name={FIELD_BY_BAND[band.key]}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add Fee Line
          </Button>
          {state.error && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

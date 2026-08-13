import { Download, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { feeStructure } from "@/lib/data/finance";
import { formatCurrency } from "@/lib/utils";

const BANDS = [
  { key: "ecd", label: "ECD" },
  { key: "primary", label: "Grade 1 to 7" },
  { key: "secondary", label: "Form 1 to 4" },
  { key: "aLevel", label: "Form 5 to 6" },
] as const;

export default function FeeStructurePage() {
  const totals = BANDS.reduce(
    (acc, band) => {
      acc[band.key] = feeStructure.reduce((sum, line) => sum + line[band.key], 0);
      return acc;
    },
    {} as Record<(typeof BANDS)[number]["key"], number>
  );

  return (
    <>
      <PageHeader
        title="Fee Structure"
        description="Per-term fee breakdown across each class band."
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" />
              Export
            </Button>
            <Button variant="accent">
              <Plus className="size-4" />
              Add Fee Line
            </Button>
          </>
        }
      />

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

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Fee Category</TableHead>
              {BANDS.map((band) => (
                <TableHead key={band.key} className="text-right">
                  {band.label}
                </TableHead>
              ))}
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
              </TableRow>
            ))}

            {feeStructure.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={BANDS.length + 1} className="py-14 text-center">
                  <p className="font-medium">No fee lines defined</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Add a fee line to build the per-term structure.
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
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>
    </>
  );
}

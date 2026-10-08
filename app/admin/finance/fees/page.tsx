import type { Metadata } from "next";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { FeeStructureTable } from "@/components/admin/fee-structure-table";
import { createClient } from "@/lib/supabase/server";
import type { FeeLine } from "@/lib/data/finance";

export const metadata: Metadata = {
  title: "Fee Structure · Administration",
  description: "Per-term fee breakdown across each class band.",
};

export default async function FeeStructurePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fee_structure_lines")
    .select("*")
    .order("created_at", { ascending: true });

  const feeStructure: FeeLine[] = (data ?? []).map((row) => ({
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
        title="Fee Structure"
        description="Per-term fee breakdown across each class band."
        actions={
          <Button variant="outline">
            <Download className="size-4" />
            Export
          </Button>
        }
      />

      <FeeStructureTable feeStructure={feeStructure} />
    </>
  );
}

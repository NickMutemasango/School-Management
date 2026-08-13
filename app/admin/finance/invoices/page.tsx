import { PageHeader } from "@/components/shared/page-header";
import { InvoiceTable } from "@/components/admin/invoice-table";

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Invoices"
        description="Issue, track, and reconcile student fee invoices."
      />
      <InvoiceTable />
    </>
  );
}

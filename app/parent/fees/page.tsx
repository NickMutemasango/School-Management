import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ChildSwitcher } from "@/components/parent/child-switcher";
import { FeeSummary } from "@/components/student/fees/fee-summary";
import { FeeBreakdownTable } from "@/components/student/fees/fee-breakdown-table";
import { PaymentHistoryTable } from "@/components/student/fees/payment-history-table";
import { getChildrenForParent } from "@/lib/parent/children";
import { getSelectedChildId, resolveSelectedChild } from "@/lib/parent/selected-child";
import { getFeeStatement } from "@/lib/students/fees";

export const metadata: Metadata = {
  title: "Fees · Guardian Portal",
  description: "Fee statement, balance, and payment history.",
};

export default async function ParentFeesPage() {
  const children = await getChildrenForParent();
  const selectedId = await getSelectedChildId();
  const child = resolveSelectedChild(children, selectedId);

  if (!child) {
    return (
      <>
        <PageHeader title="Fees" description="Fee statement, balance, and payment history." />
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={Users}
            title={children.length === 0 ? "No children linked yet" : "Choose a child"}
            description={
              children.length === 0
                ? "Contact the school office to link your account to your child's student record."
                : "Pick a child from the dashboard to see their fees."
            }
          />
        </div>
      </>
    );
  }

  const feeStatement = await getFeeStatement(child.id);

  return (
    <>
      <PageHeader
        title="Fees"
        description={
          feeStatement.term
            ? `${child.firstName} ${child.lastName}'s statement for ${feeStatement.term}.`
            : `${child.firstName} ${child.lastName}'s fee statement, balance, and payment history.`
        }
      />
      {children.length > 1 && <ChildSwitcher kids={children} selectedId={child.id} />}
      <div className="space-y-8">
        <FeeSummary statement={feeStatement} />
        <FeeBreakdownTable charges={feeStatement.charges} />
        <PaymentHistoryTable payments={feeStatement.payments} />
      </div>
    </>
  );
}

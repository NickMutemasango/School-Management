import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ChildSwitcher } from "@/components/parent/child-switcher";
import { ResultsView } from "@/components/student/results/results-view";
import { getChildrenForParent } from "@/lib/parent/children";
import { getSelectedChildId, resolveSelectedChild } from "@/lib/parent/selected-child";
import { getGradeBands } from "@/lib/admin/grade-bands";
import { getResultsForStudent } from "@/lib/students/results";

export const metadata: Metadata = {
  title: "Results · Guardian Portal",
  description: "Term results and progress across every subject.",
};

export default async function ParentResultsPage() {
  const children = await getChildrenForParent();
  const selectedId = await getSelectedChildId();
  const child = resolveSelectedChild(children, selectedId);

  if (!child) {
    return (
      <>
        <PageHeader title="Results" description="Term results and progress across every subject." />
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={Users}
            title={children.length === 0 ? "No children linked yet" : "Choose a child"}
            description={
              children.length === 0
                ? "Contact the school office to link your account to your child's student record."
                : "Pick a child from the dashboard to see their results."
            }
          />
        </div>
      </>
    );
  }

  const [termResults, bands] = await Promise.all([getResultsForStudent(child.id), getGradeBands()]);

  return (
    <>
      <PageHeader
        title="Results"
        description={`${child.firstName} ${child.lastName}'s term results and progress across every subject.`}
      />
      {children.length > 1 && <ChildSwitcher kids={children} selectedId={child.id} />}
      <ResultsView terms={termResults} bands={bands} />
    </>
  );
}

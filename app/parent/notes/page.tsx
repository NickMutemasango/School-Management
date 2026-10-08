import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ChildSwitcher } from "@/components/parent/child-switcher";
import { StudentNotesList } from "@/components/student/notes/student-notes-list";
import { getChildrenForParent } from "@/lib/parent/children";
import { getSelectedChildId, resolveSelectedChild } from "@/lib/parent/selected-child";
import { getNotesForLevel } from "@/lib/notes/fetch-notes";

export const metadata: Metadata = {
  title: "Class Notes · Guardian Portal",
  description: "Notes and resources shared by your child's teachers.",
};

export default async function ParentNotesPage() {
  const children = await getChildrenForParent();
  const selectedId = await getSelectedChildId();
  const child = resolveSelectedChild(children, selectedId);

  if (!child) {
    return (
      <>
        <PageHeader title="Class Notes" description="Notes and resources shared by your child's teachers." />
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={Users}
            title={children.length === 0 ? "No children linked yet" : "Choose a child"}
            description={
              children.length === 0
                ? "Contact the school office to link your account to your child's student record."
                : "Pick a child from the dashboard to see their class notes."
            }
          />
        </div>
      </>
    );
  }

  // No subject filter, unlike the student portal's My Class flow - a
  // parent doesn't have a "selected subject" to scope to, so this shows
  // every subject's notes for the child's class level at once; the list's
  // own subject dropdown narrows it from there.
  const notes = await getNotesForLevel(child.classLevel);

  return (
    <>
      <PageHeader
        title="Class Notes"
        description={`Notes and resources shared for ${child.firstName} ${child.lastName}'s class.`}
      />
      {children.length > 1 && <ChildSwitcher kids={children} selectedId={child.id} />}
      <StudentNotesList notes={notes} />
    </>
  );
}

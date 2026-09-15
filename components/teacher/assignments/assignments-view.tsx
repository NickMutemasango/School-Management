"use client";

import * as React from "react";

import { AssignmentUploadForm } from "./assignment-upload-form";
import { AssignmentList } from "./assignment-list";
import type { Assignment } from "@/lib/data/assignments";
import type { AssignedClassSubject } from "@/lib/teacher/assigned-classes";

interface AssignmentsViewProps {
  assignedClassSubjects: AssignedClassSubject[];
  assignments: Assignment[];
}

/**
 * Owns which assignment is expanded so posting one can open it straight
 * away. The list itself comes from the server (`getAssignmentsForTeacher`)
 * and refreshes automatically when `createAssignment`'s `revalidatePath`
 * fires - no local copy to keep in sync.
 */
export function AssignmentsView({ assignedClassSubjects, assignments }: AssignmentsViewProps) {
  const [openId, setOpenId] = React.useState<string | null>(assignments[0]?.id ?? null);

  function handleCreated(id: string) {
    setOpenId(id);
  }

  return (
    <div className="space-y-8">
      <AssignmentUploadForm
        assignedClassSubjects={assignedClassSubjects}
        onCreated={handleCreated}
      />

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold tracking-tight">Active Assignments</h2>
          <p
            aria-live="polite"
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            {assignments.length} assignment
            {assignments.length === 1 ? "" : "s"} posted
          </p>
        </div>

        <AssignmentList
          assignments={assignments}
          openId={openId}
          onOpenChange={setOpenId}
        />
      </section>
    </div>
  );
}

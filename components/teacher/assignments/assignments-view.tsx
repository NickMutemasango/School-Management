"use client";

import * as React from "react";

import { AssignmentUploadForm } from "./assignment-upload-form";
import { AssignmentList } from "./assignment-list";
import { assignmentsSeed, type Assignment } from "@/lib/data/assignments";
import type { AssignedClass } from "@/lib/teacher/assigned-classes";

/**
 * Owns the assignment list so a posted assignment appears in the viewer
 * immediately - the form and the list are two halves of one workflow.
 *
 * UI stage: seeded from mock records and held in `useState`. Swap the seed for
 * a query and `handleCreate` for a mutation when the backend lands.
 */
export function AssignmentsView({ assignedClasses }: { assignedClasses: AssignedClass[] }) {
  const [assignments, setAssignments] =
    React.useState<Assignment[]>(assignmentsSeed);
  const [openId, setOpenId] = React.useState<string | null>(
    assignmentsSeed[0]?.id ?? null
  );

  function handleCreate(assignment: Assignment) {
    // Newest first, so a freshly posted assignment is visible without
    // scrolling regardless of how far out its due date is.
    setAssignments((current) => [assignment, ...current]);
    setOpenId(assignment.id);
  }

  return (
    <div className="space-y-8">
      <AssignmentUploadForm onCreate={handleCreate} assignedClasses={assignedClasses} />

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

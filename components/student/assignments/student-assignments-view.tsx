"use client";

import * as React from "react";
import { ClipboardList } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { AssignmentCard } from "./assignment-card";
import { SubmissionDialog } from "./submission-dialog";
import {
  submissionStatusLabel,
  type StatusTally,
  type SubmissionStatus,
} from "@/lib/data/assignments";
import {
  studentAssignmentStatus,
  tallyByStatus,
  type StudentAssignment,
} from "@/lib/data/student-assignments";

type Filter = SubmissionStatus | "all";

/** `countKey` maps each tab onto its bucket in the shared tally. */
const FILTERS: Array<{
  value: Filter;
  label: string;
  countKey: keyof StatusTally;
}> = [
  { value: "all", label: "All", countKey: "total" },
  {
    value: "pending",
    label: submissionStatusLabel.student.pending,
    countKey: "pending",
  },
  {
    value: "submitted",
    label: submissionStatusLabel.student.submitted,
    countKey: "submitted",
  },
  { value: "late", label: submissionStatusLabel.student.late, countKey: "late" },
];

/**
 * Owns which assignment's submission dialog is open. The list itself comes
 * from the server (`getAssignmentsForStudent`) and refreshes automatically
 * when `submitAssignment`'s `revalidatePath` fires - no local copy to keep
 * in sync.
 */
export function StudentAssignmentsView({ assignments }: { assignments: StudentAssignment[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const tally = tallyByStatus(assignments);

  const filtered = React.useMemo(
    () =>
      filter === "all"
        ? assignments
        : assignments.filter((a) => studentAssignmentStatus(a) === filter),
    [assignments, filter]
  );

  const active = assignments.find((a) => a.id === openId) ?? null;

  if (assignments.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Work set by your teachers will appear here."
        />
      </div>
    );
  }

  return (
    <>
      {/* Status filter - mirrors the subject pills on Class Notes */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                filter === f.value
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {tally[f.countKey]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={ClipboardList}
            title="Nothing in this list"
            description={
              filter === "pending"
                ? "You're all caught up — nothing is waiting to be handed in."
                : "No assignments match this filter yet."
            }
          />
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onOpen={() => setOpenId(assignment.id)}
            />
          ))}
        </ul>
      )}

      <p
        aria-live="polite"
        className="mt-5 text-sm text-slate-500 dark:text-slate-400"
      >
        Showing {filtered.length} of {assignments.length} assignments
      </p>

      <SubmissionDialog
        assignment={active}
        open={active !== null}
        onOpenChange={(open) => !open && setOpenId(null)}
      />
    </>
  );
}

"use client";

import { ChevronRight, ClipboardList, FileText, Paperclip } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  daysUntilDue,
  dueLabel,
  submissionStatusLabel,
  submissionStatusTone,
  submissionStatusVariant,
} from "@/lib/data/assignments";
import {
  studentAssignmentStatus,
  type StudentAssignment,
} from "@/lib/data/student-assignments";

/**
 * The whole card is the click target - one keyboard stop per assignment, so
 * there are no nested buttons to tab through.
 */
export function AssignmentCard({
  assignment,
  onOpen,
}: {
  assignment: StudentAssignment;
  onOpen: () => void;
}) {
  const status = studentAssignmentStatus(assignment);
  const submission = assignment.submission;
  const days = daysUntilDue(assignment.dueOn);
  const overdue = days !== null && days < 0;
  const urgent = days !== null && days >= 0 && days <= 1;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group bg-background flex w-full flex-col rounded-2xl border border-slate-200 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:border-slate-800 dark:hover:border-slate-700"
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl",
              submissionStatusTone[status]
            )}
          >
            <ClipboardList className="size-5" aria-hidden />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={submissionStatusVariant.student[status]}>
              {submissionStatusLabel.student[status]}
            </Badge>
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            />
          </div>
        </div>

        <h3 className="mt-4 font-bold tracking-tight">{assignment.title}</h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {assignment.subject} · {assignment.teacherName}
        </p>

        <p
          className={cn(
            "mt-3 text-sm font-medium",
            status === "pending" && overdue && "text-rose-600 dark:text-rose-400",
            status === "pending" &&
              urgent &&
              "text-amber-600 dark:text-amber-400",
            !(status === "pending" && (overdue || urgent)) &&
              "text-slate-500 dark:text-slate-400"
          )}
        >
          {assignment.dueOn ? formatDate(assignment.dueOn) : "No due date"}
          {" · "}
          {dueLabel(assignment.dueOn)}
        </p>

        {/* Submitted work, or the prompt to hand something in. */}
        {submission ? (
          <p className="mt-4 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
            <FileText className="size-4 shrink-0 text-slate-400" aria-hidden />
            <span className="truncate font-medium">{submission.fileName}</span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {submission.fileSizeLabel}
            </span>
          </p>
        ) : (
          <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:bg-blue-950">
            <Paperclip className="size-3.5 shrink-0" aria-hidden />
            Submit your work
          </span>
        )}
      </button>
    </li>
  );
}

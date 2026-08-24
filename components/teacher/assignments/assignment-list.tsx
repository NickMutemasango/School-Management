"use client";

import * as React from "react";
import {
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  Paperclip,
  Users,
} from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  classSize,
  daysUntilDue,
  dueLabel,
  submissionStatus,
  submissionStatusLabel,
  submissionStatusVariant,
  tallySubmissions,
  type Assignment,
} from "@/lib/data/assignments";

interface AssignmentListProps {
  assignments: Assignment[];
  /**
   * Single-open accordion, controlled by the parent so posting an assignment
   * can expand it straight away.
   */
  openId: string | null;
  onOpenChange: (id: string | null) => void;
}

export function AssignmentList({
  assignments,
  openId,
  onOpenChange,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Assignments you post will be listed here with their submissions."
        />
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {assignments.map((assignment) => (
        <li key={assignment.id}>
          <AssignmentRow
            assignment={assignment}
            open={openId === assignment.id}
            onToggle={() =>
              onOpenChange(openId === assignment.id ? null : assignment.id)
            }
          />
        </li>
      ))}
    </ul>
  );
}

function AssignmentRow({
  assignment,
  open,
  onToggle,
}: {
  assignment: Assignment;
  open: boolean;
  onToggle: () => void;
}) {
  const tally = tallySubmissions(assignment);
  const days = daysUntilDue(assignment.dueOn);
  const isClosed = days !== null && days < 0;
  const isUrgent = days !== null && days >= 0 && days <= 1;

  const panelId = `${assignment.id}-submissions`;
  const expected =
    classSize(assignment.classLevel) ?? assignment.submissions.length;

  return (
    <div className="bg-background overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          // The panel is rendered lazily, so only point at it once it exists -
          // a dangling aria-controls target confuses screen readers.
          aria-controls={open ? panelId : undefined}
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:hover:bg-slate-800/60"
        >
          <ClipboardList className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />

          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{assignment.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{assignment.classLevel}</span>
              <span aria-hidden className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span
                className={cn(
                  "font-medium",
                  isClosed && "text-rose-600 dark:text-rose-400",
                  isUrgent && "text-amber-600 dark:text-amber-400"
                )}
              >
                {dueLabel(assignment.dueOn)}
              </span>
              {assignment.fileName && (
                <>
                  <span aria-hidden className="text-slate-300 dark:text-slate-600">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Paperclip className="size-3 shrink-0" aria-hidden />
                    Brief attached
                  </span>
                </>
              )}
            </span>
          </span>

          <span className="hidden shrink-0 items-center gap-1.5 text-sm text-slate-500 sm:flex dark:text-slate-400">
            <Users className="size-4 shrink-0" aria-hidden />
            <span className="tabular-nums">
              {tally.received} of {expected}
            </span>
            <span className="sr-only">submissions received</span>
          </span>

          {tally.late > 0 && (
            <Badge variant="warning" className="hidden shrink-0 md:inline-flex">
              {tally.late} late
            </Badge>
          )}

          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-slate-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </h3>

      {open && (
        <div
          id={panelId}
          className="border-t border-slate-200 dark:border-slate-800"
        >
          {assignment.description && (
            <p className="border-b border-slate-200 px-4 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {assignment.description}
            </p>
          )}

          <dl className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
            <div className="flex items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Due</dt>
              <dd className="font-medium tabular-nums">
                {assignment.dueOn ? formatDate(assignment.dueOn) : "—"}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Submitted</dt>
              <dd className="font-medium tabular-nums">{tally.submitted}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Late</dt>
              <dd className="font-medium tabular-nums">{tally.late}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Outstanding</dt>
              <dd className="font-medium tabular-nums">{tally.missing}</dd>
            </div>
          </dl>

          {assignment.submissions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions yet"
              description="Work handed in by students will be listed here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16 pr-4 text-right">File</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {assignment.submissions.map((submission) => {
                  const status = submissionStatus(
                    submission.submittedOn,
                    assignment.dueOn
                  );
                  const handedIn = status !== "missing";

                  return (
                    <TableRow key={submission.id}>
                      <TableCell className="pl-4">
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {submission.regNumber}
                        </p>
                      </TableCell>

                      <TableCell className="text-muted-foreground tabular-nums">
                        {handedIn ? formatDate(submission.submittedOn) : "—"}
                      </TableCell>

                      <TableCell>
                        {handedIn ? (
                          <Badge variant="secondary" className="max-w-[14rem]">
                            <Paperclip className="shrink-0" aria-hidden />
                            <span className="truncate">
                              {submission.fileName}
                            </span>
                            <span className="text-muted-foreground shrink-0 font-normal">
                              {submission.fileSizeLabel}
                            </span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant={submissionStatusVariant[status]}>
                          {submissionStatusLabel[status]}
                        </Badge>
                      </TableCell>

                      <TableCell className="pr-4 text-right">
                        {handedIn ? (
                          <button
                            type="button"
                            aria-label={`Download ${submission.fileName} from ${submission.studentName}`}
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          >
                            <Download className="size-4" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}

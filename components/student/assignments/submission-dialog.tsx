"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  Upload,
} from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilePreviewDialog } from "@/components/shared/file-preview-dialog";
import { dueLabel, daysUntilDue } from "@/lib/data/assignments";
import {
  formatFileSize,
  studentAssignmentStatus,
  type StudentAssignment,
} from "@/lib/data/student-assignments";
import { submitAssignment, type SubmitAssignmentState } from "@/app/student/assignments/actions";
import { getAssignmentBriefUrl, getSubmissionDownloadUrl } from "@/lib/assignments/actions";

interface SubmissionDialogProps {
  assignment: StudentAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionDialog({ assignment, open, onOpenChange }: SubmissionDialogProps) {
  // Remounts the form each time the dialog opens, so a previous attempt's
  // error/pending state (held by useActionState, which has no external
  // reset) can't leak into the next one.
  const [instance, setInstance] = React.useState(0);
  React.useEffect(() => {
    if (open) setInstance((n) => n + 1);
  }, [open]);

  if (!assignment) return null;

  return (
    <SubmissionForm
      key={instance}
      assignment={assignment}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

const initialState: SubmitAssignmentState = { error: null };

function SubmissionForm({
  assignment,
  open,
  onOpenChange,
}: {
  assignment: StudentAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(submitAssignment, initialState);
  const [file, setFile] = React.useState<File | null>(null);
  const [note, setNote] = React.useState(assignment.submission?.note ?? "");
  const [briefPreviewOpen, setBriefPreviewOpen] = React.useState(false);
  const [submissionPreviewOpen, setSubmissionPreviewOpen] = React.useState(false);
  const submittedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isPending && submittedRef.current && !state.error) {
      submittedRef.current = false;
      onOpenChange(false);
    }
    // Only re-check when a submission attempt finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, state.error]);

  const status = studentAssignmentStatus(assignment);
  const existing = assignment.submission;
  const isResubmit = existing !== null;
  const overdue = (daysUntilDue(assignment.dueOn) ?? 0) < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            {assignment.subject} · {assignment.teacherName}
          </DialogDescription>
        </DialogHeader>

        {assignment.description && (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {assignment.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
          <span className="inline-flex items-center gap-2">
            <CalendarClock
              className={cn(
                "size-4 shrink-0",
                overdue ? "text-rose-500" : "text-slate-400"
              )}
              aria-hidden
            />
            <span className="text-slate-500 dark:text-slate-400">Due</span>
            <span className="font-medium tabular-nums">
              {assignment.dueOn ? formatDate(assignment.dueOn) : "—"}
            </span>
            <span
              className={cn(
                "font-medium",
                overdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              ({dueLabel(assignment.dueOn)})
            </span>
          </span>

          {assignment.briefFileName && (
            <>
              <button
                type="button"
                onClick={() => setBriefPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-blue-400"
              >
                <Paperclip className="size-4 shrink-0" aria-hidden />
                {assignment.briefFileName}
              </button>
              <FilePreviewDialog
                open={briefPreviewOpen}
                onOpenChange={setBriefPreviewOpen}
                fileName={assignment.briefFileName}
                loadPreviewUrl={() => getAssignmentBriefUrl(assignment.id)}
                loadDownloadUrl={() => getAssignmentBriefUrl(assignment.id, true)}
              />
            </>
          )}
        </div>

        {existing && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              {status === "late" ? "Submitted late" : "Already submitted"}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-600 dark:text-slate-300">
              <FileText className="size-4 shrink-0 text-slate-400" aria-hidden />
              <button
                type="button"
                onClick={() => setSubmissionPreviewOpen(true)}
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {existing.fileName}
              </button>
              <span className="text-slate-400">·</span>
              <span>{existing.fileSizeLabel}</span>
              <span className="text-slate-400">·</span>
              <span>{formatDate(existing.submittedOn)}</span>
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Uploading again replaces this file.
            </p>
            <FilePreviewDialog
              open={submissionPreviewOpen}
              onOpenChange={setSubmissionPreviewOpen}
              fileName={existing.fileName}
              loadPreviewUrl={() => getSubmissionDownloadUrl(existing.id)}
              loadDownloadUrl={() => getSubmissionDownloadUrl(existing.id, true)}
            />
          </div>
        )}

        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
          noValidate
          className="space-y-4"
        >
          <input type="hidden" name="assignmentId" value={assignment.id} />

          <div className="grid gap-2">
            <Label htmlFor="submissionFile">
              {isResubmit ? "Replace your file" : "Your file"}
            </Label>
            <label
              className={cn(
                "bg-background flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors hover:border-blue-400",
                state.error && !file
                  ? "border-red-400"
                  : "border-slate-300 dark:border-slate-700"
              )}
            >
              <Upload
                className={cn(
                  "size-6 shrink-0",
                  file ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                )}
                aria-hidden
              />
              {file ? (
                <>
                  <span className="max-w-full truncate text-sm font-medium">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)} · click to choose a different
                    file
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    Choose a file to upload
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    PDF, Word, or an image of your written work
                  </span>
                </>
              )}
              <input
                id="submissionFile"
                type="file"
                name="file"
                className="sr-only"
                aria-invalid={Boolean(state.error) && !file}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="submissionNote">
              Note for your teacher{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </Label>
            <textarea
              id="submissionNote"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything your teacher should know about this submission..."
              className="bg-background w-full rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
            />
          </div>

          {state.error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          {overdue && !existing && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              This deadline has passed — your submission will be marked as late.
            </p>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Submitting&hellip;
                </>
              ) : (
                <>
                  <Upload className="size-4" aria-hidden />
                  {isResubmit ? "Replace Submission" : "Submit Assignment"}
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

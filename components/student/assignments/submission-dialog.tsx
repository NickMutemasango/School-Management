"use client";

import * as React from "react";
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
import { dueLabel, daysUntilDue } from "@/lib/data/assignments";
import {
  formatFileSize,
  studentAssignmentStatus,
  type StudentAssignment,
  type StudentSubmission,
} from "@/lib/data/student-assignments";

interface SubmissionDialogProps {
  assignment: StudentAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hands the completed submission back to the list. */
  onSubmit: (assignmentId: string, submission: StudentSubmission) => void;
}

export function SubmissionDialog({
  assignment,
  open,
  onOpenChange,
  onSubmit,
}: SubmissionDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset whenever a different assignment is opened, so one submission's
  // draft never leaks into the next.
  React.useEffect(() => {
    if (open) {
      setFile(null);
      setNote(assignment?.submission?.note ?? "");
      setSaving(false);
      setError(null);
    }
  }, [open, assignment?.id, assignment?.submission?.note]);

  if (!assignment) return null;

  const status = studentAssignmentStatus(assignment);
  const existing = assignment.submission;
  const isResubmit = existing !== null;
  const overdue = (daysUntilDue(assignment.dueOn) ?? 0) < 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment) return;

    if (!file) {
      setError("Choose a file to upload before submitting.");
      return;
    }

    setError(null);
    setSaving(true);

    // No backend yet - stand in for the upload request.
    await new Promise((resolve) => setTimeout(resolve, 900));

    onSubmit(assignment.id, {
      fileName: file.name,
      fileSizeLabel: formatFileSize(file.size),
      submittedOn: new Date().toISOString().slice(0, 10),
      note: note.trim(),
    });

    setSaving(false);
    onOpenChange(false);
  }

  const errorId = error ? "submissionError" : undefined;

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
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-blue-400"
            >
              <Paperclip className="size-4 shrink-0" aria-hidden />
              {assignment.briefFileName}
            </button>
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
              <span className="font-medium">{existing.fileName}</span>
              <span className="text-slate-400">·</span>
              <span>{existing.fileSizeLabel}</span>
              <span className="text-slate-400">·</span>
              <span>{formatDate(existing.submittedOn)}</span>
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Uploading again replaces this file.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="submissionFile">
              {isResubmit ? "Replace your file" : "Your file"}
            </Label>
            <label
              className={cn(
                "bg-background flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors hover:border-blue-400",
                error && !file
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
                className="sr-only"
                aria-invalid={Boolean(error) && !file}
                aria-describedby={errorId}
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setError(null);
                }}
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
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything your teacher should know about this submission..."
              className="bg-background w-full rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
            />
          </div>

          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {error}
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
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
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

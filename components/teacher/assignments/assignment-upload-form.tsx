"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { DateSelectField } from "@/components/shared/date-select-field";
import type { AssignedClassSubject } from "@/lib/teacher/assigned-classes";
import { createAssignment, type CreateAssignmentState } from "@/app/teacher/assignments/actions";

/**
 * Shared field chrome, matching `notes-upload-form.tsx` so the two teacher
 * upload tools read as one component.
 */
const FIELD =
  "bg-background h-11 rounded-lg border border-slate-200 px-3 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800";

interface AssignmentUploadFormProps {
  assignedClassSubjects: AssignedClassSubject[];
  /** Called with the new assignment's id once it's saved, so it can open straight away. */
  onCreated: (id: string) => void;
}

const initialState: CreateAssignmentState = { error: null };

export function AssignmentUploadForm({ assignedClassSubjects, onCreated }: AssignmentUploadFormProps) {
  const [state, formAction, isPending] = useActionState(createAssignment, initialState);
  const [chosenFile, setChosenFile] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  // Bumped only on an actual success, unlike keying directly off
  // `state.createdId` - that fell back to a fixed "new" on any *later*
  // failed submission too, remounting the form (wiping whatever the teacher
  // had just typed for the next assignment) even though nothing succeeded.
  const [formKey, setFormKey] = React.useState(0);
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (state.createdId) {
      onCreated(state.createdId);
      setChosenFile(null);
      setShowSuccess(true);
      setFormKey((k) => k + 1);
    }
    // Only re-run when a fresh id comes back from the action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.createdId]);

  const errorId = state.error ? "assignmentError" : undefined;

  return (
    <section className="bg-card rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <ClipboardList className="size-[18px] text-slate-500" />
        Create an assignment
      </h2>

      <form
        // Remounts on every successful post, so DateSelectField's internal
        // day/month/year state (and every other uncontrolled field) clears
        // properly - a plain form.reset() can't reach into a controlled
        // child component's own state.
        key={formKey}
        action={formAction}
        onChange={() => setShowSuccess(false)}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="assignmentTitle">Assignment Title</Label>
            <input
              ref={titleRef}
              id="assignmentTitle"
              name="title"
              placeholder="e.g. Quadratic Equations — Problem Set 4"
              aria-describedby={errorId}
              className={cn(FIELD, "w-full px-4 placeholder:text-slate-400")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignmentClass">Class</Label>
            <select
              id="assignmentClass"
              name="classTeacherSubjectId"
              disabled={assignedClassSubjects.length === 0}
              aria-describedby={errorId}
              className={FIELD}
            >
              <option value="">
                {assignedClassSubjects.length === 0 ? "No classes assigned yet" : "Select class"}
              </option>
              {assignedClassSubjects.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <DateSelectField
            id="assignmentDueOn"
            name="dueOn"
            label="Due Date"
            minYear={new Date().getFullYear()}
            maxYear={new Date().getFullYear() + 1}
          />
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="assignmentDescription">
            Description{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <textarea
            id="assignmentDescription"
            name="description"
            rows={3}
            placeholder="What should students do, and what are you marking for?"
            className="bg-background w-full rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label
            className={cn(
              "bg-background flex h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 text-sm transition-colors hover:border-blue-400 dark:border-slate-700",
              chosenFile ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
            )}
          >
            <Upload className="size-4 shrink-0" />
            <span className="truncate">
              {chosenFile ?? "Attach a brief (optional)"}
            </span>
            <input
              type="file"
              name="brief"
              className="sr-only"
              aria-label="Attach a brief for this assignment"
              onChange={(e) => setChosenFile(e.target.files?.[0]?.name ?? null)}
            />
          </label>

          <button
            type="submit"
            disabled={isPending || assignedClassSubjects.length === 0}
            aria-busy={isPending}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Posting&hellip;
              </>
            ) : (
              "Post Assignment"
            )}
          </button>
        </div>

        {state.error && (
          <p
            id={errorId}
            role="alert"
            className="mt-3 text-sm font-medium text-red-600"
          >
            {state.error}
          </p>
        )}

        {!state.error && showSuccess && (
          <p
            role="status"
            className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            Assignment posted — it&rsquo;s now listed below.
          </p>
        )}
      </form>
    </section>
  );
}

"use client";

import * as React from "react";
import { CheckCircle2, ClipboardList, Loader2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { DateSelectField } from "@/components/shared/date-select-field";
import { CLASS_LEVELS } from "@/lib/data/class-levels";
import type { Assignment } from "@/lib/data/assignments";

/**
 * Shared field chrome, matching `notes-upload-form.tsx` so the two teacher
 * upload tools read as one component. Kept as a constant rather than repeated
 * inline - the notes form predates this and repeats it five times.
 */
const FIELD =
  "bg-background h-11 rounded-lg border border-slate-200 px-3 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800";

type Status = "idle" | "saving" | "done";

interface AssignmentUploadFormProps {
  /** Called with the new assignment once the mock save resolves. */
  onCreate: (assignment: Assignment) => void;
}

/** Create-assignment UI only - no persistence yet. */
export function AssignmentUploadForm({ onCreate }: AssignmentUploadFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [classLevel, setClassLevel] = React.useState("");
  const [dueOn, setDueOn] = React.useState("");
  const [chosenFile, setChosenFile] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const titleRef = React.useRef<HTMLInputElement>(null);

  const canSubmit =
    title.trim() !== "" &&
    classLevel !== "" &&
    dueOn !== "" &&
    status !== "saving";

  /** Any edit clears the success banner so it can't go stale on screen. */
  function touch() {
    setStatus((s) => (s === "done" ? "idle" : s));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (title.trim() === "") {
      setError("Give the assignment a title.");
      titleRef.current?.focus();
      return;
    }
    if (classLevel === "") {
      setError("Choose the class this assignment is for.");
      return;
    }
    if (dueOn === "") {
      setError("Set a due date so students know the deadline.");
      return;
    }

    setError(null);
    setStatus("saving");

    // No backend yet - stand in for the create request.
    await new Promise((resolve) => setTimeout(resolve, 900));

    onCreate({
      id: `asg_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      classLevel,
      dueOn,
      fileName: chosenFile ?? "",
      submissions: [],
    });

    setStatus("done");
    setTitle("");
    setDescription("");
    setClassLevel("");
    setDueOn("");
    setChosenFile(null);
  }

  const errorId = error ? "assignmentError" : undefined;

  return (
    <section className="bg-card rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <ClipboardList className="size-[18px] text-slate-500" />
        Create an assignment
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="assignmentTitle">Assignment Title</Label>
            <input
              ref={titleRef}
              id="assignmentTitle"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                touch();
              }}
              placeholder="e.g. Quadratic Equations — Problem Set 4"
              aria-invalid={Boolean(error) && title.trim() === ""}
              aria-describedby={errorId}
              className={cn(FIELD, "w-full px-4 placeholder:text-slate-400")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignmentClass">Class</Label>
            <select
              id="assignmentClass"
              value={classLevel}
              onChange={(e) => {
                setClassLevel(e.target.value);
                touch();
              }}
              aria-invalid={Boolean(error) && classLevel === ""}
              aria-describedby={errorId}
              className={FIELD}
            >
              <option value="">Select class</option>
              {CLASS_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <DateSelectField
            id="assignmentDueOn"
            label="Due Date"
            value={dueOn}
            onChange={(v) => {
              setDueOn(v);
              touch();
            }}
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
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              touch();
            }}
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
              className="sr-only"
              aria-label="Attach a brief for this assignment"
              onChange={(e) => {
                setChosenFile(e.target.files?.[0]?.name ?? null);
                touch();
              }}
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            aria-busy={status === "saving"}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "saving" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Posting&hellip;
              </>
            ) : (
              "Post Assignment"
            )}
          </button>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-3 text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}

        {status === "done" && (
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

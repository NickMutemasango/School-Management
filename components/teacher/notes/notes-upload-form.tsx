"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { EXAM_BODIES } from "@/lib/data/notes";
import { uploadNote, type UploadNoteState } from "@/app/teacher/notes/actions";

const initialState: UploadNoteState = { error: null };

interface NotesUploadFormProps {
  level: string;
  /** Subjects the signed-in teacher is assigned at this level - restricts and pre-selects the picker. */
  subjects: string[];
}

export function NotesUploadForm({ level, subjects }: NotesUploadFormProps) {
  const [state, formAction, isPending] = useActionState(uploadNote, initialState);
  const [chosenFileName, setChosenFileName] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [justUploaded, setJustUploaded] = React.useState(false);

  // `useActionState` doesn't tell us "succeeded" directly - a null error
  // after a real submit means success, so reset the form and show it.
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!state.error) {
      formRef.current?.reset();
      setChosenFileName(null);
      setJustUploaded(true);
    }
  }, [state]);

  return (
    <section className="bg-card rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Upload className="size-[18px] text-slate-500" />
        Upload a file
      </h2>

      <form
        ref={formRef}
        action={(formData) => {
          setJustUploaded(false);
          formAction(formData);
        }}
      >
        <input type="hidden" name="level" value={level} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="noteSubject">Subject</Label>
            {subjects.length <= 1 ? (
              <>
                <div className="bg-background flex h-11 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:text-slate-300">
                  {subjects[0] ?? "No subject assigned"}
                </div>
                <input type="hidden" name="subject" value={subjects[0] ?? ""} />
              </>
            ) : (
              <select
                id="noteSubject"
                name="subject"
                required
                defaultValue={subjects[0]}
                className="bg-background h-11 rounded-lg border border-slate-200 px-3 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="noteExamBody">Exam Body</Label>
            <select
              id="noteExamBody"
              name="examBody"
              defaultValue="ZIMSEC"
              className="bg-background h-11 rounded-lg border border-slate-200 px-3 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
            >
              {EXAM_BODIES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="noteFileName">File Name</Label>
          <input
            id="noteFileName"
            name="fileName"
            required
            placeholder="e.g. Chapter 1 Notes"
            className="bg-background h-11 w-full rounded-lg border border-slate-200 px-4 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label
            className={cn(
              "bg-background flex h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 text-sm transition-colors hover:border-blue-400 dark:border-slate-700",
              chosenFileName ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
            )}
          >
            <Upload className="size-4 shrink-0" />
            <span className="truncate">{chosenFileName ?? "Choose file"}</span>
            <input
              type="file"
              name="file"
              required
              className="sr-only"
              aria-label={`Choose a file to upload for ${level}`}
              onChange={(e) => setChosenFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>

          <button
            type="submit"
            disabled={isPending || subjects.length === 0}
            aria-busy={isPending}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading&hellip;
              </>
            ) : justUploaded ? (
              <>
                <CheckCircle2 className="size-4" />
                Uploaded
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>

        {state.error && (
          <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}
      </form>
    </section>
  );
}

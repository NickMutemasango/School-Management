"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { EXAM_BODIES, SUBJECTS } from "@/lib/data/notes";

/** Upload UI only - no persistence yet. */
export function NotesUploadForm({ level }: { level: string }) {
  const [subject, setSubject] = React.useState("");
  const [examBody, setExamBody] = React.useState<string>("ZIMSEC");
  const [fileName, setFileName] = React.useState("");
  const [chosenFile, setChosenFile] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const canUpload = subject !== "" && fileName.trim() !== "" && chosenFile !== null;

  async function handleUpload() {
    if (!canUpload) {
      setError("Choose a subject, name the file, and select a file to upload.");
      return;
    }
    setError(null);
    setStatus("uploading");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("done");
    setSubject("");
    setFileName("");
    setChosenFile(null);
  }

  return (
    <section className="bg-card rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Upload className="size-[18px] text-slate-500" />
        Upload a file
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="noteSubject">Subject</Label>
          <select
            id="noteSubject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setStatus("idle");
            }}
            className="bg-background h-11 rounded-lg border border-slate-200 px-3 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
          >
            <option value="">Select subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="noteExamBody">Exam Body</Label>
          <select
            id="noteExamBody"
            value={examBody}
            onChange={(e) => setExamBody(e.target.value)}
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
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
            setStatus("idle");
          }}
          placeholder="e.g. Chapter 1 Notes"
          className="bg-background h-11 w-full rounded-lg border border-slate-200 px-4 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
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
          <span className="truncate">{chosenFile ?? "Choose file"}</span>
          <input
            type="file"
            className="sr-only"
            aria-label={`Choose a file to upload for ${level}`}
            onChange={(e) => {
              setChosenFile(e.target.files?.[0]?.name ?? null);
              setStatus("idle");
            }}
          />
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={status === "uploading"}
          aria-busy={status === "uploading"}
          className={cn(
            "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold text-white transition-colors focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none",
            canUpload || status !== "idle"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-400 hover:bg-blue-500"
          )}
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading&hellip;
            </>
          ) : status === "done" ? (
            <>
              <CheckCircle2 className="size-4" />
              Uploaded
            </>
          ) : (
            "Upload"
          )}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}

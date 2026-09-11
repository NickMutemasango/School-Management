"use client";

import * as React from "react";
import { AlertCircle, Download, FileText, Loader2 } from "lucide-react";

import type { NoteFile } from "@/lib/data/notes";
import { getNoteDownloadUrl } from "@/lib/notes/actions";

/** Read-only note row: students download, they never delete. */
export function NoteFileRow({ file }: { file: NoteFile }) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleDownload() {
    startTransition(async () => {
      const { url, error: downloadError } = await getNoteDownloadUrl(file.id);
      if (url) {
        window.location.href = url;
        setError(null);
      } else {
        setError(downloadError ?? "Could not download this file.");
      }
    });
  }

  return (
    <li className="bg-background flex flex-col gap-1 rounded-xl border border-slate-200 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
      <div className="flex items-center gap-3">
        <FileText className="size-4 shrink-0 text-slate-400" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {file.uploadedOn} · {file.sizeLabel}
          </p>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleDownload}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none disabled:opacity-50 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950"
          aria-label={`Download ${file.name}`}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 pl-7 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </li>
  );
}

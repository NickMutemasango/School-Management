import { Download, FileText } from "lucide-react";

import type { NoteFile } from "@/lib/data/notes";

/** Read-only note row: students download, they never delete. */
export function NoteFileRow({ file }: { file: NoteFile }) {
  return (
    <li className="bg-background flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
      <FileText className="size-4 shrink-0 text-slate-400" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {file.uploadedOn} · {file.sizeLabel}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950"
        aria-label={`Download ${file.name}`}
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Download</span>
      </button>
    </li>
  );
}

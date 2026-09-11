"use client";

import * as React from "react";
import { AlertCircle, BookOpen, Download, FileText, Loader2, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { examBodyClass, groupBySubject, type NoteFile } from "@/lib/data/notes";
import { getNoteDownloadUrl } from "@/lib/notes/actions";
import { deleteNote } from "@/app/teacher/notes/actions";

export function NotesFileList({ files, level }: { files: NoteFile[]; level: string }) {
  const groups = groupBySubject(files);

  if (groups.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={FileText}
          title="No notes uploaded yet"
          description="Files you upload for this class will be listed here by subject."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.subject}>
          <header className="mb-3 flex flex-wrap items-center gap-2.5">
            <BookOpen className="size-[18px] shrink-0 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold tracking-tight">{group.subject}</h2>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide",
                examBodyClass[group.examBody]
              )}
            >
              {group.examBody}
            </span>
            <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
              {group.files.length} file{group.files.length === 1 ? "" : "s"}
            </span>
          </header>

          <ul className="space-y-2">
            {group.files.map((file) => (
              <FileRow key={file.id} file={file} level={level} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function FileRow({ file, level }: { file: NoteFile; level: string }) {
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

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteNote(file.id, level);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={`Download ${file.name}`}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          <span className="hidden sm:inline">View</span>
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"
          aria-label={`Delete ${file.name}`}
        >
          <Trash2 className="size-4" />
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

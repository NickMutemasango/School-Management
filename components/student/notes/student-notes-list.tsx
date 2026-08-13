"use client";

import * as React from "react";
import { BookOpen, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteFileRow } from "./note-file-row";
import { examBodyClass, groupBySubject, type NoteFile } from "@/lib/data/notes";

export function StudentNotesList({ notes }: { notes: NoteFile[] }) {
  const [query, setQuery] = React.useState("");
  const [subject, setSubject] = React.useState("all");

  const subjects = React.useMemo(
    () => ["all", ...Array.from(new Set(notes.map((n) => n.subject))).sort()],
    [notes]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      const matchesQuery =
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q);
      const matchesSubject = subject === "all" || n.subject === subject;
      return matchesQuery && matchesSubject;
    });
  }, [notes, query, subject]);

  const groups = groupBySubject(filtered);
  const hasNotes = notes.length > 0;

  return (
    <>
      {hasNotes && (
        <>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes by name or subject"
              aria-label="Search notes"
              className="bg-background h-12 w-full rounded-xl border border-slate-200 pr-4 pl-11 text-sm shadow-sm outline-none transition-shadow placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                aria-pressed={subject === s}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  subject === s
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60"
                )}
              >
                {s === "all" ? "All subjects" : s}
              </button>
            ))}
          </div>
        </>
      )}

      {groups.length === 0 ? (
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={BookOpen}
            title={hasNotes ? "No notes found" : "No notes shared yet"}
            description={
              hasNotes
                ? "Try a different search term or clear the subject filter."
                : "Notes and resources uploaded by your teachers will appear here."
            }
          />
        </div>
      ) : (
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
                  <NoteFileRow key={file.id} file={file} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {hasNotes && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Showing {filtered.length} of {notes.length} files
        </p>
      )}
    </>
  );
}

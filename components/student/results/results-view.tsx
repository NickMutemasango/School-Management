"use client";

import * as React from "react";
import { Download, FileText, MessageSquareQuote } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultsSummary } from "./results-summary";
import { ResultsTable } from "./results-table";
import type { TermResult } from "@/lib/data/student-results";

export function ResultsView({ terms }: { terms: TermResult[] }) {
  const [termId, setTermId] = React.useState(
    terms.find((t) => t.current)?.id ?? terms[0]?.id ?? ""
  );

  const term = terms.find((t) => t.id === termId);

  if (terms.length === 0 || !term) {
    return (
      <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
        <EmptyState
          icon={FileText}
          title="No results published yet"
          description="Your term results will appear here once your teachers publish them."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Term selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {terms.map((t) => (
            <button
              key={t.id}
              onClick={() => setTermId(t.id)}
              aria-pressed={t.id === termId}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                t.id === termId
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60"
              )}
            >
              {t.label}
              {t.current && (
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  LATEST
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 px-4 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
        >
          <Download className="size-4" />
          Download report
        </button>
      </div>

      <ResultsSummary term={term} />

      <ResultsTable subjects={term.subjects} />

      {/* Comments */}
      {(term.classTeacherComment || term.headComment) && (
        <div className="grid gap-5 sm:grid-cols-2">
          {term.classTeacherComment && (
            <CommentCard
              title="Class Teacher"
              comment={term.classTeacherComment}
            />
          )}
          {term.headComment && (
            <CommentCard title="Head of School" comment={term.headComment} />
          )}
        </div>
      )}
    </div>
  );
}

function CommentCard({ title, comment }: { title: string; comment: string }) {
  return (
    <section className="bg-background rounded-2xl border border-slate-200 p-5 shadow-sm dark:border-slate-800">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold tracking-tight">
        <MessageSquareQuote className="size-4 shrink-0 text-slate-400" />
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {comment}
      </p>
    </section>
  );
}

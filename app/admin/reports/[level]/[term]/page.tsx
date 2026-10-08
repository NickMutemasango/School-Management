import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { ClassReportCard } from "@/components/admin/reports/class-report-card";
import { EmptyState } from "@/components/shared/empty-state";
import { levelFromSlug, levelSlug } from "@/lib/data/class-levels";
import { termFromSlug, currentAcademicYear } from "@/lib/data/terms";
import { getTermReportsForLevel } from "@/lib/admin/reports";
import { getGradeBands } from "@/lib/admin/grade-bands";

interface PageProps {
  params: Promise<{ level: string; term: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level: levelSlugParam, term: termSlugParam } = await params;
  const level = levelFromSlug(levelSlugParam);
  const term = termFromSlug(termSlugParam);
  return {
    title:
      level && term ? `${level} · ${term} Reports · Administration` : "Reports · Administration",
  };
}

export default async function AdminTermReportsPage({ params }: PageProps) {
  const { level: levelSlugParam, term: termSlugParam } = await params;
  const level = levelFromSlug(levelSlugParam);
  const term = termFromSlug(termSlugParam);
  if (!level || !term) notFound();

  const academicYear = currentAcademicYear();
  const [reports, bands] = await Promise.all([
    getTermReportsForLevel(level, term, academicYear),
    getGradeBands(),
  ]);
  if (reports.length === 0) notFound();

  return (
    <>
      <Link
        href={`/admin/reports/${levelSlug(level)}`}
        className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="size-4" />
        Back to Terms
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {level} &middot; {term}
      </h1>
      <p className="mt-1.5 mb-6 text-slate-500 dark:text-slate-400">
        Read-only mark sheets collated from every subject teacher&rsquo;s saved results.
      </p>

      <div className="space-y-6">
        {reports.map((report) => (
          <ClassReportCard key={report.classId} report={report} bands={bands} />
        ))}

        {reports.every((r) => r.students.length === 0) && (
          <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
            <EmptyState
              icon={FileText}
              title="No students enrolled"
              description="Classes at this level don't have any enrolled students yet."
            />
          </div>
        )}
      </div>
    </>
  );
}

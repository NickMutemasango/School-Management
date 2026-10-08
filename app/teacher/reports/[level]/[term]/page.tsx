import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { TermEntryView } from "@/components/teacher/reports/term-entry-view";
import { levelFromSlug, levelSlug } from "@/lib/data/class-levels";
import { termFromSlug, currentAcademicYear } from "@/lib/data/terms";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTermEntryData } from "@/lib/teacher/reports";

interface PageProps {
  params: Promise<{ level: string; term: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level: levelSlugParam, term: termSlugParam } = await params;
  const level = levelFromSlug(levelSlugParam);
  const term = termFromSlug(termSlugParam);
  return {
    title:
      level && term
        ? `${level} · ${term} Reports · Teacher Portal`
        : "Reports · Teacher Portal",
  };
}

export default async function TermEntryPage({ params }: PageProps) {
  const { level: levelSlugParam, term: termSlugParam } = await params;
  const level = levelFromSlug(levelSlugParam);
  const term = termFromSlug(termSlugParam);
  if (!level || !term) notFound();

  const user = await getCurrentUser();
  const academicYear = currentAcademicYear();
  const data = user
    ? await getTermEntryData(user.id, level, term, academicYear)
    : { classes: [], remarks: [] };

  if (data.classes.length === 0) notFound();

  return (
    <>
      <Link
        href={`/teacher/reports/${levelSlug(level)}`}
        className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="size-4" />
        Back to Terms
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {level} · {term}
      </h1>
      <p className="mt-1.5 mb-6 text-slate-500 dark:text-slate-400">
        Enter marks and comments per subject. A blank mark leaves that student
        ungraded rather than scoring zero.
      </p>

      <TermEntryView term={term} academicYear={academicYear} data={data} />
    </>
  );
}

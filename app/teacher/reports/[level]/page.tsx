import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ReportTermList } from "@/components/teacher/reports/report-term-list";
import { CLASS_LEVELS, levelFromSlug, levelSlug } from "@/lib/data/class-levels";
import { reportClassFor } from "@/lib/data/teacher-reports";

interface PageProps {
  params: Promise<{ level: string }>;
}

export function generateStaticParams() {
  return CLASS_LEVELS.map((level) => ({ level: levelSlug(level) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level: slug } = await params;
  const level = levelFromSlug(slug);
  return {
    title: level
      ? `${level} Reports — Teacher Portal`
      : "Class Reports — Teacher Portal",
  };
}

export default async function ReportsLevelPage({ params }: PageProps) {
  const { level: slug } = await params;
  const level = levelFromSlug(slug);
  const cls = level ? reportClassFor(level) : undefined;

  if (!level || !cls) notFound();

  return (
    <>
      <Link
        href="/teacher/reports"
        className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="size-4" />
        Back to Classes
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{level}</h1>
      <p className="mt-1.5 mb-6 text-slate-500 dark:text-slate-400">
        Choose a term to create or edit student reports ({cls.studentCount}{" "}
        students in this class).
      </p>

      <ReportTermList terms={cls.terms} />
    </>
  );
}

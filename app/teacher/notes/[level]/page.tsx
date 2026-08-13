import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NotesUploadForm } from "@/components/teacher/notes/notes-upload-form";
import { NotesFileList } from "@/components/teacher/notes/notes-file-list";
import { CLASS_LEVELS, levelFromSlug, levelSlug } from "@/lib/data/class-levels";
import { notesByLevel } from "@/lib/data/teacher-notes";

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
      ? `${level} Notes — Teacher Portal`
      : "Class Notes — Teacher Portal",
  };
}

export default async function NotesLevelPage({ params }: PageProps) {
  const { level: slug } = await params;
  const level = levelFromSlug(slug);

  if (!level) notFound();

  const files = notesByLevel[level] ?? [];

  return (
    <>
      <Link
        href="/teacher/notes"
        className="mb-4 inline-flex items-center gap-2 rounded text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="size-4" />
        Back to Classes
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">{level}</h1>

      <div className="space-y-8">
        <NotesUploadForm level={level} />
        <NotesFileList files={files} />
      </div>
    </>
  );
}

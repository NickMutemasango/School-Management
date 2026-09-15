import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, FileText, GraduationCap, ScrollText } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { getClassSubjectForStudent } from "@/lib/students/classmates";

export const metadata: Metadata = {
  title: "Class Details · Student Portal",
};

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params;
  const subject = await getClassSubjectForStudent(id);

  if (!subject) notFound();

  const links = [
    {
      title: "Assignments",
      description: "Work set for this subject, and what you've handed in.",
      href: "/student/assignments",
      icon: ClipboardList,
    },
    {
      title: "Materials",
      description: "Notes and resources shared for this subject.",
      href: "/student/notes",
      icon: FileText,
    },
    {
      title: "Grades",
      description: "Your term results and progress.",
      href: "/student/results",
      icon: GraduationCap,
    },
  ];

  return (
    <>
      <PageHeader
        title={subject.subject}
        description={`${subject.teacherName} · ${subject.level} · ${subject.section}`}
      />

      <div className="space-y-6">
        <ul className="grid gap-4 sm:grid-cols-3">
          {links.map((link) => (
            <li key={link.title}>
              <Link
                href={link.href}
                className="group bg-background flex h-full flex-col rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:hover:border-slate-700"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <link.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-bold tracking-tight">{link.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {link.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="bg-background rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <ScrollText className="size-[18px] text-slate-500" />
            Class Policies
          </h2>
          {subject.policies ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              {subject.policies}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              No policies have been posted for this subject yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

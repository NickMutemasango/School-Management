import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, FileText, IdCard, Wallet } from "lucide-react";

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}

const LINKS: QuickLink[] = [
  {
    title: "Personal Details",
    description: "Review and update your contact and guardian information",
    href: "/student/personal-details",
    icon: IdCard,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    title: "Class Notes",
    description: "Download notes and resources shared by your teachers",
    href: "/student/notes",
    icon: BookOpen,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  {
    title: "Results",
    description: "Term results and progress across every subject",
    href: "/student/results",
    icon: FileText,
    tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  },
  {
    title: "Fees",
    description: "Statements, payment history, and outstanding balance",
    href: "/student/fees",
    icon: Wallet,
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
];

export function QuickLinks() {
  return (
    <section>
      <h2 className="mb-4 font-bold tracking-tight">Quick Links</h2>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-background flex flex-col rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:border-slate-800 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${link.tone}`}
                >
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>

              <h3 className="mt-4 font-bold tracking-tight">{link.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

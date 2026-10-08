import type { Metadata } from "next";
import Link from "next/link";
import { FileText, GraduationCap, NotebookPen, Users, Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ChildPicker } from "@/components/parent/child-picker";
import { ChildSwitcher } from "@/components/parent/child-switcher";
import { getChildrenForParent } from "@/lib/parent/children";
import { getSelectedChildId, resolveSelectedChild } from "@/lib/parent/selected-child";

export const metadata: Metadata = {
  title: "Dashboard · Guardian Portal",
  description: "Your children's results, fees, and class notes.",
};

const LINKS = [
  { href: "/parent/results", title: "Results", description: "Term marks, grades, and class position.", icon: FileText },
  { href: "/parent/fees", title: "Fees", description: "Statement, balance, and payment history.", icon: Wallet },
  { href: "/parent/notes", title: "Class Notes", description: "Notes and resources shared by teachers.", icon: NotebookPen },
];

export default async function ParentDashboardPage() {
  const children = await getChildrenForParent();

  if (children.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" description="Your children's results, fees, and class notes." />
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={Users}
            title="No children linked yet"
            description="Contact the school office to link your account to your child's student record."
          />
        </div>
      </>
    );
  }

  const selectedId = await getSelectedChildId();
  const child = resolveSelectedChild(children, selectedId);

  return (
    <>
      <PageHeader title="Dashboard" description="Your children's results, fees, and class notes." />

      {children.length > 1 && <ChildSwitcher kids={children} selectedId={child?.id ?? null} />}

      {!child ? (
        <ChildPicker kids={children} />
      ) : (
        <div className="space-y-6">
          <div className="bg-background flex items-center gap-4 rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              <GraduationCap className="size-7" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {child.firstName} {child.lastName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {child.classLevel} &middot; {child.regNumber}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-background flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <link.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{link.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

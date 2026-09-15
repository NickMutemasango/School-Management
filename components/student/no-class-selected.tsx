import Link from "next/link";
import { School } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

/** Shown on any subject-scoped page when the student hasn't picked one yet. */
export function NoClassSelected({ what }: { what: string }) {
  return (
    <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
      <EmptyState
        icon={School}
        title="Pick a class first"
        description={`Choose one of your subjects on the dashboard to see its ${what}.`}
      />
      <div className="flex justify-center pb-10">
        {/* Subject cards live on the dashboard, not /student/class (which
            is just the classmates/teachers reference page) - see the "move
            my classes to the dashboard" change. */}
        <Link
          href="/student"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

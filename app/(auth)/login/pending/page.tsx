import type { Metadata } from "next";
import { Clock3 } from "lucide-react";

import { BRAND, WORDMARK_CLASS } from "@/lib/brand";
import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Awaiting Approval",
  description: "Your staff account is awaiting administrator approval.",
};

export default function PendingApprovalPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <div className="grid size-24 place-items-center rounded-full bg-amber-500 text-white shadow-lg">
            <Clock3 className="size-11" aria-hidden />
          </div>
        </div>
        <p className={`mb-2 text-xs text-slate-400 dark:text-slate-500 ${WORDMARK_CLASS}`}>
          {BRAND.name}
        </p>
        <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
          Account Pending Approval
        </h1>
        <p className="mb-8 text-slate-600 dark:text-slate-300">
          Your Google account is signed in, but a portal administrator still
          needs to approve access before you can enter the staff portal.
          Check back later, or contact the school office.
        </p>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-xl border border-slate-300 bg-white/70 px-4 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-400 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

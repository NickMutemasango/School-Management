import type { Metadata } from "next";
import { ShieldOff } from "lucide-react";

import { BRAND, WORDMARK_CLASS } from "@/lib/brand";
import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Access Denied",
  description: "This account's access has been suspended.",
};

export default function SuspendedAccountPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <div className="grid size-24 place-items-center rounded-full bg-rose-500 text-white shadow-lg">
            <ShieldOff className="size-11" aria-hidden />
          </div>
        </div>
        <p className={`mb-2 text-xs text-slate-400 dark:text-slate-500 ${WORDMARK_CLASS}`}>
          {BRAND.name}
        </p>
        <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
          Access Suspended
        </h1>
        <p className="mb-8 text-slate-600 dark:text-slate-300">
          A portal administrator has suspended this account. Contact the school
          office if you believe this is a mistake.
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

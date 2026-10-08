import type { Metadata } from "next";
import { KeyRound, Shield } from "lucide-react";

import { BRAND, WORDMARK_CLASS } from "@/lib/brand";

import { SetPasswordForm } from "@/components/auth/set-password-form";

export const metadata: Metadata = {
  title: "Set Password",
  description: "Choose a password for your account.",
};

export default function SetPasswordPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className="grid size-24 place-items-center rounded-full bg-blue-600 text-white shadow-lg">
              <KeyRound className="size-11" aria-hidden />
            </div>
          </div>
          <p className={`mb-2 text-xs text-slate-400 dark:text-slate-500 ${WORDMARK_CLASS}`}>{BRAND.name}</p>
          <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-slate-100">Set Your Password</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Choose a password to finish setting up your account.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <SetPasswordForm />
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-950/50 dark:text-green-400">
            <Shield className="size-4" aria-hidden />
            Secure Login Protected
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">{BRAND.copyright}</p>
      </div>
    </div>
  );
}

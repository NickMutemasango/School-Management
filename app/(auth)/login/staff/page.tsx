import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Briefcase, Shield } from "lucide-react";

import { BRAND, WORDMARK_CLASS } from "@/lib/brand";

import { StaffAuth } from "@/components/auth/staff-auth";

export const metadata: Metadata = {
  title: "Staff Sign In",
  description: "Sign in to access the staff portal.",
};

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className="grid size-24 place-items-center rounded-full bg-blue-600 text-white shadow-lg">
              <Briefcase className="size-11" aria-hidden />
            </div>
          </div>
          <p className={`mb-2 text-xs text-slate-400 dark:text-slate-500 ${WORDMARK_CLASS}`}>{BRAND.name}</p>
          <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-slate-100">Staff Portal</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Continue with Google, or your email and password
          </p>
        </div>

        {/* Sign-in / sign-up card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          {error && (
            <p
              role="alert"
              className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/50 dark:text-red-400"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              Something went wrong signing in with Google. Please try again.
            </p>
          )}
          <StaffAuth next={next} />
        </div>

        {/* Trust badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-950/50 dark:text-green-400">
            <Shield className="size-4" aria-hidden />
            Secure Login Protected
          </div>
        </div>

        {/* Cross-link */}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Student?{" "}
          <Link
            href={`/login/student${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-blue-600 underline-offset-4 dark:text-blue-400 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none"
          >
            Sign in here
          </Link>
        </p>

        {/* Copyright - last element on the page */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {BRAND.copyright}
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Shield } from "lucide-react";

import { StaffGoogleAuth } from "@/components/auth/staff-google-auth";

export const metadata: Metadata = {
  title: "Staff Sign In — School Admin",
  description: "Sign in with Google to access the staff portal.",
};

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className="grid size-24 place-items-center rounded-full bg-blue-600 text-white shadow-lg">
              <Briefcase className="size-11" aria-hidden />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-800">Staff Portal</h1>
          <p className="text-slate-600">
            Continue with your institute Google account
          </p>
        </div>

        {/* Sign-in / sign-up card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
          <StaffGoogleAuth />
        </div>

        {/* Trust badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <Shield className="size-4" aria-hidden />
            Secure Login Protected
          </div>
        </div>

        {/* Cross-link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Student?{" "}
          <Link
            href="/login/student"
            className="font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

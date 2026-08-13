import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ChevronRight, GraduationCap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — School Admin",
  description: "Choose how you sign in to the Innovate Institute portal.",
};

const ROLES = [
  {
    href: "/login/student",
    icon: GraduationCap,
    title: "Student",
    description: "Results, invoices, and your registration details",
  },
  {
    href: "/login/staff",
    icon: Briefcase,
    title: "Staff",
    description: "Administration, finance, and teaching portals",
  },
] as const;

export default function LoginChooserPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className="grid size-24 place-items-center rounded-full bg-blue-600 text-white shadow-lg">
              <GraduationCap className="size-11" aria-hidden />
            </div>
          </div>
          <h1 className="text-slate-600">Choose how you&rsquo;d like to sign in</h1>
        </div>

        {/* Role picker */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            {ROLES.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className="group flex items-center gap-4 rounded-xl border border-slate-300 bg-white/70 p-4 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-400 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <role.icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-800">
                    {role.title}
                  </span>
                  <span className="block text-sm text-slate-500">
                    {role.description}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
                  aria-hidden
                />
              </Link>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Students sign in with a registration number. Staff sign in with
            their institute Google account.
          </p>
        </div>

        {/* Trust badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <Shield className="size-4" aria-hidden />
            Secure Login Protected
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";

/** Google's four-colour "G" mark. Lucide has no brand icons, so it's inline. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A21.99 21.99 0 0 0 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/** Segmented pill, matching the portal's filter rail. */
function TabPill({ value, label }: { value: string; label: string }) {
  return (
    <Tabs.Trigger
      value={value}
      className={cn(
        "flex-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all outline-none",
        "text-slate-500 hover:text-slate-800",
        "focus-visible:ring-2 focus-visible:ring-blue-500/30",
        "data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm"
      )}
    >
      {label}
    </Tabs.Trigger>
  );
}

/**
 * Google-only entry points for staff, split into Sign In / Sign Up sections
 * so only one is shown at a time. UI stage: the buttons are inert
 * placeholders — wire them to the OAuth flow when auth lands.
 */
export function StaffGoogleAuth() {
  return (
    <Tabs.Root defaultValue="signin" className="space-y-6">
      <Tabs.List
        aria-label="Staff account options"
        className="flex gap-1 rounded-xl bg-slate-100 p-1.5"
      >
        <TabPill value="signin" label="Sign In" />
        <TabPill value="signup" label="Sign Up" />
      </Tabs.List>

      <Tabs.Content value="signin" className="space-y-4 outline-none">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white">
            <GoogleMark className="size-4" />
          </span>
          Log in with Google
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <p className="text-center text-sm text-slate-500">
          Use the Google account issued by the institute.
        </p>
      </Tabs.Content>

      <Tabs.Content value="signup" className="space-y-4 outline-none">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white/70 px-4 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-400 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <GoogleMark className="size-5 shrink-0" />
          Sign up with Google
          <UserPlus className="size-4" aria-hidden />
        </button>

        <p className="text-center text-sm text-slate-500">
          A portal administrator approves new staff accounts before access is
          granted.
        </p>
      </Tabs.Content>
    </Tabs.Root>
  );
}

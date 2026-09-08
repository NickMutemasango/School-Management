"use client";

import * as React from "react";
import { useActionState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  signInWithGoogle,
  signInStaffWithPassword,
  signUpStaffWithPassword,
  type StaffSignInState,
  type StaffSignUpState,
} from "@/app/(auth)/login/staff/actions";

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
        "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        "focus-visible:ring-2 focus-visible:ring-blue-500/30",
        "data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm",
        "dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
      )}
    >
      {label}
    </Tabs.Trigger>
  );
}

const INPUT_CLASS =
  "flex w-full rounded-xl border border-slate-300 bg-white/70 px-3.5 py-2.5 text-sm backdrop-blur-sm transition-colors outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/60";

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

function MethodToggle({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-center text-sm font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
    >
      {children}
    </button>
  );
}

/**
 * Two entry points for staff, split into Sign In / Sign Up sections so only
 * one is shown at a time. Each offers Google (default) or email/password -
 * both land in the same teacher/pending state on first sign-up (see
 * migration 0004), so which one someone picks is purely their preference.
 */
export function StaffAuth({ next }: { next?: string }) {
  const [signInMethod, setSignInMethod] = React.useState<"google" | "password">("google");
  const [signUpMethod, setSignUpMethod] = React.useState<"google" | "password">("google");

  return (
    <Tabs.Root defaultValue="signin" className="space-y-6">
      <Tabs.List
        aria-label="Staff account options"
        className="flex gap-1 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800"
      >
        <TabPill value="signin" label="Sign In" />
        <TabPill value="signup" label="Sign Up" />
      </Tabs.List>

      <Tabs.Content value="signin" className="space-y-4 outline-none">
        {signInMethod === "google" ? (
          <>
            <form action={signInWithGoogle}>
              {next && <input type="hidden" name="next" value={next} />}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white">
                  <GoogleMark className="size-4" />
                </span>
                Log in with Google
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Use the Google account issued by the institute.
            </p>

            <MethodToggle onClick={() => setSignInMethod("password")}>
              Or sign in with email and password
            </MethodToggle>
          </>
        ) : (
          <>
            <StaffSignInPasswordForm next={next} />
            <MethodToggle onClick={() => setSignInMethod("google")}>
              Use Google instead
            </MethodToggle>
          </>
        )}
      </Tabs.Content>

      <Tabs.Content value="signup" className="space-y-4 outline-none">
        {signUpMethod === "google" ? (
          <>
            <form action={signInWithGoogle} className="space-y-4">
              {next && <input type="hidden" name="next" value={next} />}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="Jane"
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder="Moyo"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white/70 px-4 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-400 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
              >
                <GoogleMark className="size-5 shrink-0" />
                Sign up with Google
                <UserPlus className="size-4" aria-hidden />
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              A portal administrator approves new staff accounts before access is
              granted.
            </p>

            <MethodToggle onClick={() => setSignUpMethod("password")}>
              Or sign up with email and password
            </MethodToggle>
          </>
        ) : (
          <>
            <StaffSignUpPasswordForm next={next} />
            <MethodToggle onClick={() => setSignUpMethod("google")}>
              Use Google instead
            </MethodToggle>
          </>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}

const signInInitialState: StaffSignInState = { error: null };

function StaffSignInPasswordForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(
    signInStaffWithPassword,
    signInInitialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="space-y-1.5">
        <label
          htmlFor="staffSignInEmail"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          Email
        </label>
        <input
          id="staffSignInEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
          placeholder="you@yourschool.org"
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="staffSignInPassword"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          Password
        </label>
        <input
          id="staffSignInPassword"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
          className={INPUT_CLASS}
        />
      </div>

      {state.error && <ErrorText>{state.error}</ErrorText>}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Mail className="size-4" aria-hidden />
        )}
        Sign In
      </button>
    </form>
  );
}

const signUpInitialState: StaffSignUpState = { error: null, needsConfirmation: false };

function StaffSignUpPasswordForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(
    signUpStaffWithPassword,
    signUpInitialState
  );

  if (state.needsConfirmation) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
        Check your email to confirm your address, then sign in with your new
        password.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="staffSignUpFirstName"
            className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
          >
            First name
          </label>
          <input
            id="staffSignUpFirstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            disabled={isPending}
            placeholder="Jane"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="staffSignUpLastName"
            className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
          >
            Last name
          </label>
          <input
            id="staffSignUpLastName"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            disabled={isPending}
            placeholder="Moyo"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="staffSignUpEmail"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          Email
        </label>
        <input
          id="staffSignUpEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
          placeholder="you@yourschool.org"
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="staffSignUpPassword"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          Password
        </label>
        <input
          id="staffSignUpPassword"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
          placeholder="At least 8 characters"
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="staffSignUpConfirmPassword"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          Confirm password
        </label>
        <input
          id="staffSignUpConfirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
          className={INPUT_CLASS}
        />
      </div>

      {state.error && <ErrorText>{state.error}</ErrorText>}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-4 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-400 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <UserPlus className="size-4" aria-hidden />
        )}
        Create Account
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        A portal administrator approves new staff accounts before access is
        granted.
      </p>
    </form>
  );
}

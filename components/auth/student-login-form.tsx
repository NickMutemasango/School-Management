"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, ArrowRight, Loader2, Lock, Shield, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { signInStudent, type StudentLoginState } from "@/app/(auth)/login/student/actions";

/**
 * Permissive enough for both hyphenated formats (REG-2024-0012) and the
 * compact registry style (R261701a), while still rejecting junk input.
 */
const REG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/-]{3,23}$/;

const ERRORS = {
  empty: "Please enter your registration number.",
  invalid: "Please enter a valid Registration Number.",
} as const;

function validate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return ERRORS.empty;
  if (!REG_PATTERN.test(trimmed)) return ERRORS.invalid;
  return null;
}

const initialState: StudentLoginState = { error: null };

export function StudentLoginForm({ next }: { next?: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [regNumber, setRegNumber] = React.useState("");
  const [regError, setRegError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [state, formAction, isLoading] = useActionState(
    signInStudent,
    initialState
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setRegNumber(value);
    // Re-validate live only after the first submit attempt, so the field
    // doesn't turn red while the student is still typing.
    if (submitted) setRegError(validate(value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitted(true);

    const validationError = validate(regNumber);
    if (validationError) {
      e.preventDefault();
      setRegError(validationError);
      inputRef.current?.focus();
    }
  }

  const hasRegError = Boolean(regError);

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="regNumber"
            className="flex items-center gap-2 text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
          >
            <User className="size-4" aria-hidden />
            Registration Number
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              id="regNumber"
              name="regNumber"
              type="text"
              autoFocus
              autoComplete="username"
              spellCheck={false}
              disabled={isLoading}
              value={regNumber}
              onChange={handleChange}
              placeholder="Enter your registration number"
              aria-invalid={hasRegError}
              aria-describedby={hasRegError ? "regNumber-error" : undefined}
              className={cn(
                "flex w-full rounded-xl border bg-white/70 px-4 py-3 text-lg backdrop-blur-sm transition-colors outline-none dark:bg-slate-800/60",
                "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
                hasRegError
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700"
              )}
            />
          </div>

          {hasRegError && (
            <p
              id="regNumber-error"
              role="alert"
              className="flex items-start gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {regError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="flex items-center gap-2 text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
          >
            <Lock className="size-4" aria-hidden />
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="Enter your password"
            required
            className={cn(
              "flex w-full rounded-xl border bg-white/70 px-4 py-3 text-lg backdrop-blur-sm transition-colors outline-none dark:bg-slate-800/60",
              "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
              "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700"
            )}
          />

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Given to you by the school office when you enrolled.
          </p>
        </div>

        {state.error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {state.error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Signing you in&hellip;
            </>
          ) : (
            <>
              <Shield className="size-5" aria-hidden />
              Go to Your Account
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

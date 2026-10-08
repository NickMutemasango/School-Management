"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";

import { setPassword, type SetPasswordState } from "@/app/set-password/actions";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/auth/validation";

const INPUT_CLASS =
  "flex w-full rounded-xl border border-slate-300 bg-white/70 px-3.5 py-2.5 text-sm backdrop-blur-sm transition-colors outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/60";

const initialState: SetPasswordState = { error: null };

export function SetPasswordForm() {
  const [state, formAction, isPending] = useActionState(setPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="newPassword"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          New Password
        </label>
        <input
          id="newPassword"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          disabled={isPending}
          placeholder={`${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`}
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmNewPassword"
          className="text-sm leading-none font-semibold text-slate-700 dark:text-slate-300"
        >
          Confirm Password
        </label>
        <input
          id="confirmNewPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          disabled={isPending}
          className={INPUT_CLASS}
        />
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

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <KeyRound className="size-4" aria-hidden />
        )}
        Set Password
      </button>
    </form>
  );
}

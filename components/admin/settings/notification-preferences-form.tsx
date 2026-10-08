"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateNotificationPreferences } from "@/app/admin/settings/actions";

export function NotificationPreferencesForm({ notifyAdminsOnStaffSignup }: { notifyAdminsOnStaffSignup: boolean }) {
  const [enabled, setEnabled] = React.useState(notifyAdminsOnStaffSignup);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      try {
        await updateNotificationPreferences(next);
      } catch (err) {
        setEnabled(!next);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Control which events send email notifications.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">New staff sign-up emails</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Email every active admin when a new staff account is awaiting approval.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Toggle new staff sign-up emails"
            disabled={isPending}
            onClick={toggle}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
              enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "inline-block size-4 transform rounded-full bg-white shadow transition-transform",
                enabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {isPending && (
          <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            Saving...
          </p>
        )}
        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

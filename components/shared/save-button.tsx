"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Save control with an idle -> saving -> saved lifecycle. Disabled while there
 * is nothing to save. `onSave` runs once the simulated request resolves and
 * should commit the form's snapshot.
 */
export function SaveButton({
  isDirty,
  onSave,
  label = "Save changes",
}: {
  isDirty: boolean;
  onSave: () => void;
  label?: string;
}) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  async function handleClick() {
    setIsSaving(true);
    // No backend yet - stand in for the persist request.
    await new Promise((resolve) => setTimeout(resolve, 700));
    onSave();
    setSavedAt(
      new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    );
    setIsSaving(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSaving || !isDirty}
      aria-busy={isSaving}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none",
        isDirty
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
        isSaving && "opacity-70"
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Saving&hellip;
        </>
      ) : isDirty ? (
        <>
          <Save className="size-4" />
          {label}
        </>
      ) : (
        <>
          <CheckCircle2 className="size-4" />
          Saved{savedAt ? ` at ${savedAt}` : ""}
        </>
      )}
    </button>
  );
}

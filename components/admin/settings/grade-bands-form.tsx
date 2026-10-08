"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { saveGradeBands, type GradeBandInput } from "@/app/admin/settings/actions";
import type { Grade, GradeBand } from "@/lib/data/student-results";

const EDITABLE_GRADES: Grade[] = ["A", "B", "C", "D", "E"];

export function GradeBandsForm({ bands }: { bands: GradeBand[] }) {
  const initial = new Map(bands.map((b) => [b.grade, b.min]));
  const [thresholds, setThresholds] = React.useState<Record<string, string>>(
    Object.fromEntries(EDITABLE_GRADES.map((g) => [g, String(initial.get(g) ?? "")]))
  );
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function submit() {
    setSaved(false);
    const entries: GradeBandInput[] = EDITABLE_GRADES.map((grade) => ({
      grade,
      min: Number(thresholds[grade]),
    }));

    startTransition(async () => {
      const result = await saveGradeBands(entries);
      setError(result.error);
      setSaved(result.error === null);
    });
  }

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle>Grading Bands</CardTitle>
        <CardDescription>
          The minimum percentage for each grade. A mark earns the highest grade whose threshold it meets.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {EDITABLE_GRADES.map((grade) => (
            <div key={grade} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold">
                {grade}
              </span>
              <Label htmlFor={`band-${grade}`} className="sr-only">
                {grade} threshold
              </Label>
              <Input
                id={`band-${grade}`}
                type="number"
                min={0}
                max={100}
                value={thresholds[grade]}
                onChange={(e) => setThresholds((prev) => ({ ...prev, [grade]: e.target.value }))}
                className="w-28"
              />
              <span className="text-muted-foreground text-sm">% and above</span>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold">
              U
            </span>
            <span className="text-muted-foreground text-sm">Below the E threshold (not editable)</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="size-4 shrink-0" />
            Saved.
          </p>
        )}

        <Button type="button" variant="accent" className="mt-5" disabled={isPending} onClick={submit}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Save Grading Bands
        </Button>
      </CardContent>
    </Card>
  );
}

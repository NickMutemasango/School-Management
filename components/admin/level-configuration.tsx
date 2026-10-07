"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activateLevel, deactivateLevel } from "@/app/admin/levels/actions";

export interface LevelRow {
  levelDefinitionId: string;
  displayLabel: string;
  active: boolean;
  /** Null when the level has never been activated for this year. */
  offeringId: string | null;
}

export function LevelConfiguration({
  levels,
  academicYear,
}: {
  levels: LevelRow[];
  academicYear: number;
}) {
  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle>Curriculum Levels</CardTitle>
        <CardDescription>
          From the Zimbabwe Heritage-Based Curriculum catalogue - activate only the levels this
          school teaches.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y pt-2">
        {levels.map((level) => (
          <LevelRowItem key={level.levelDefinitionId} level={level} academicYear={academicYear} />
        ))}
      </CardContent>
    </Card>
  );
}

function LevelRowItem({ level, academicYear }: { level: LevelRow; academicYear: number }) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function toggle() {
    startTransition(async () => {
      try {
        if (level.active && level.offeringId) {
          await deactivateLevel(level.offeringId);
        } else {
          await activateLevel(level.levelDefinitionId, academicYear);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <span className="font-medium">{level.displayLabel}</span>
        <Badge variant={level.active ? "success" : "neutral"}>
          {level.active ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {error && <span className="text-xs font-medium text-destructive">{error}</span>}
        <Button
          size="sm"
          variant={level.active ? "outline" : "default"}
          disabled={isPending}
          onClick={toggle}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {level.active ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEEKDAYS, teachingPeriods, periodById, type Weekday } from "@/lib/data/teacher-schedule";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  type CreateTimetableEntryState,
} from "@/app/admin/timetable/actions";

export interface AssignmentOption {
  id: string;
  /** e.g. "Grade 5 · A — Mathematics — Mrs. Dube" */
  label: string;
}

export interface TimetableEntryRow {
  id: string;
  day: Weekday;
  periodId: string;
  room: string;
  subject: string;
  teacherName: string;
  className: string;
}

interface TimetableBuilderProps {
  assignments: AssignmentOption[];
  entries: TimetableEntryRow[];
}

export function TimetableBuilder({ assignments, entries }: TimetableBuilderProps) {
  const entriesByDay = React.useMemo(() => {
    const groups = new Map<Weekday, TimetableEntryRow[]>();
    for (const entry of entries) {
      const list = groups.get(entry.day) ?? [];
      list.push(entry);
      groups.set(entry.day, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => {
        const pa = periodById(a.periodId)?.startTime ?? "";
        const pb = periodById(b.periodId)?.startTime ?? "";
        return pa.localeCompare(pb);
      });
    }
    return groups;
  }, [entries]);

  return (
    <div className="space-y-8">
      <CreateEntryCard assignments={assignments} />

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No timetable entries yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Add one above to start building the weekly schedule.
            </p>
          </CardContent>
        </Card>
      ) : (
        WEEKDAYS.map((day) => {
          const dayEntries = entriesByDay.get(day) ?? [];
          if (dayEntries.length === 0) return null;

          return (
            <Card key={day}>
              <CardHeader className="border-b py-5">
                <CardTitle>{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-6">
                {dayEntries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} />
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

const createEntryInitialState: CreateTimetableEntryState = { error: null };

function CreateEntryCard({ assignments }: { assignments: AssignmentOption[] }) {
  const [state, formAction, isPending] = useActionState(
    createTimetableEntry,
    createEntryInitialState
  );

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle>Add Timetable Entry</CardTitle>
        <CardDescription>
          Assign a day, period, and room to an existing class-subject assignment.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="classTeacherSubjectId">Assignment</Label>
            <Select name="classTeacherSubjectId" required>
              <SelectTrigger id="classTeacherSubjectId" className="w-72">
                <SelectValue placeholder="Select class · subject · teacher" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="day">Day</Label>
            <Select name="day" required>
              <SelectTrigger id="day" className="w-36">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="periodId">Period</Label>
            <Select name="periodId" required>
              <SelectTrigger id="periodId" className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {teachingPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.startTime}–{period.endTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="room">Room</Label>
            <Input id="room" name="room" placeholder="e.g. Lab 2" className="w-28" />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add Entry
          </Button>

          {state.error && (
            <p className="flex items-center gap-1 text-sm font-medium text-destructive">
              <AlertCircle className="size-3.5 shrink-0" />
              {state.error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function EntryRow({ entry }: { entry: TimetableEntryRow }) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const period = periodById(entry.periodId);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTimetableEntry(entry.id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-4">
        <div className="w-24 shrink-0 text-sm font-semibold tabular-nums">
          {period?.startTime}–{period?.endTime}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {entry.className} — {entry.subject}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {entry.teacherName}
            {entry.room ? ` · ${entry.room}` : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {error && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}
        <Button size="sm" variant="ghost" disabled={isPending} onClick={handleDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

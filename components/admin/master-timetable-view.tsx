"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimetableGrid } from "@/components/teacher/schedule/timetable-grid";
import type { TimetableEntry, Weekday } from "@/lib/data/teacher-schedule";

export interface MasterTimetableEntry {
  id: string;
  day: Weekday;
  periodId: string;
  room: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
}

export interface PivotOption {
  id: string;
  label: string;
}

interface MasterTimetableViewProps {
  entries: MasterTimetableEntry[];
  teachers: PivotOption[];
  classes: PivotOption[];
}

type Pivot = "teacher" | "class";

/**
 * The same weekly grid every teacher sees for themselves
 * (`components/teacher/schedule/timetable-grid.tsx`), reused unmodified -
 * only the label fed into each cell changes with the pivot (the class when
 * viewing by teacher, the teacher when viewing by class). One flat list of
 * every entry, already fetched for the builder above, is filtered
 * client-side - no extra query.
 */
export function MasterTimetableView({ entries, teachers, classes }: MasterTimetableViewProps) {
  const [pivot, setPivot] = React.useState<Pivot>("teacher");
  const options = pivot === "teacher" ? teachers : classes;
  const [selectedId, setSelectedId] = React.useState<string>(options[0]?.id ?? "");

  React.useEffect(() => {
    const list = pivot === "teacher" ? teachers : classes;
    if (!list.some((o) => o.id === selectedId)) setSelectedId(list[0]?.id ?? "");
    // Only re-derive the selection when the pivot itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pivot]);

  const filtered = entries.filter((e) =>
    pivot === "teacher" ? e.teacherId === selectedId : e.classId === selectedId
  );

  const gridEntries: TimetableEntry[] = filtered.map((e) => ({
    id: e.id,
    day: e.day,
    periodId: e.periodId,
    room: e.room,
    subject: e.subject,
    className: pivot === "teacher" ? e.className : e.teacherName,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="View by"
          className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          <PivotButton active={pivot === "teacher"} onClick={() => setPivot("teacher")} label="By Teacher" />
          <PivotButton active={pivot === "class"} onClick={() => setPivot("class")} label="By Class" />
        </div>

        {options.length > 0 && (
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder={`Select a ${pivot}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {options.length === 0 ? (
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={CalendarRange}
            title={pivot === "teacher" ? "No teachers assigned yet" : "No classes yet"}
            description="Assign a class-subject to a teacher first, then their schedule shows up here."
          />
        </div>
      ) : (
        <TimetableGrid entries={gridEntries} />
      )}
    </div>
  );
}

function PivotButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-slate-900 shadow-sm dark:text-slate-100"
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      {label}
    </button>
  );
}

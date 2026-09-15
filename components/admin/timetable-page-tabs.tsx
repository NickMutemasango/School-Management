"use client";

import * as React from "react";
import { CalendarRange, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TimetableBuilder,
  type AssignmentOption,
  type TimetableEntryRow,
} from "@/components/admin/timetable-builder";
import {
  MasterTimetableView,
  type MasterTimetableEntry,
  type PivotOption,
} from "@/components/admin/master-timetable-view";

type Tab = "manage" | "master";

interface TimetablePageTabsProps {
  assignments: AssignmentOption[];
  entries: TimetableEntryRow[];
  masterEntries: MasterTimetableEntry[];
  teachers: PivotOption[];
  classes: PivotOption[];
}

/** Same builder+list as before under "Manage"; "Master Schedule" is a new
 * read-only per-teacher/per-class grid over the exact same fetched entries. */
export function TimetablePageTabs({
  assignments,
  entries,
  masterEntries,
  teachers,
  classes,
}: TimetablePageTabsProps) {
  const [tab, setTab] = React.useState<Tab>("manage");

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="Timetable view"
        className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
      >
        <TabButton active={tab === "manage"} onClick={() => setTab("manage")} icon={Wrench} label="Manage" />
        <TabButton
          active={tab === "master"}
          onClick={() => setTab("master")}
          icon={CalendarRange}
          label="Master Schedule"
        />
      </div>

      {tab === "manage" ? (
        <TimetableBuilder assignments={assignments} entries={entries} />
      ) : (
        <MasterTimetableView entries={masterEntries} teachers={teachers} classes={classes} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Wrench;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-slate-900 shadow-sm dark:text-slate-100"
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

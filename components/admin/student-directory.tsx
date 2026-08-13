"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Printer, Search, SlidersHorizontal, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentProfileDialog } from "./student-profile-dialog";
import {
  CLASS_LEVELS,
  enrollmentStatusLabel,
  enrollmentStatusVariant,
  students,
  type EnrollmentStatus,
  type Student,
} from "@/lib/data/students";
import { cn, formatCurrency, initials } from "@/lib/utils";

const STATUS_FILTERS: Array<{ value: EnrollmentStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deregistered", label: "Deregistered" },
];

export function StudentDirectory() {
  const [query, setQuery] = React.useState("");
  const [classLevel, setClassLevel] = React.useState<string>("ALL");
  const [status, setStatus] = React.useState<EnrollmentStatus | "all">("all");
  const [selected, setSelected] = React.useState<Student | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQuery =
        !q ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.classLevel.toLowerCase().includes(q);
      const matchesClass = classLevel === "ALL" || s.classLevel === classLevel;
      const matchesStatus = status === "all" || s.status === status;
      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [query, classLevel, status]);

  const hasRecords = students.length > 0;
  const isFiltered = query.trim() !== "" || classLevel !== "ALL" || status !== "all";

  return (
    <>
      {/* Search + actions */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, reg number, or class"
            className="pl-11"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as EnrollmentStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 opacity-60" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="shrink-0">
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>

          <Button variant="accent" asChild className="shrink-0">
            <Link href="/admin/students/enroll">
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Enroll Student</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Class level rail - mirrors the portal's segmented pill filter */}
      <div className="bg-muted mb-5 flex flex-wrap gap-1 rounded-xl p-1.5">
        <ClassPill
          label="ALL"
          active={classLevel === "ALL"}
          onClick={() => setClassLevel("ALL")}
        />
        {CLASS_LEVELS.map((level) => (
          <ClassPill
            key={level}
            label={level}
            active={classLevel === level}
            onClick={() => setClassLevel(level)}
          />
        ))}
      </div>

      {/* Directory table */}
      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-6">#</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Reg Number</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Fee Balance</TableHead>
              <TableHead className="w-16 pr-6 text-right">View</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((student, i) => (
              <TableRow
                key={student.id}
                className="cursor-pointer"
                onClick={() => setSelected(student)}
              >
                <TableCell className="text-muted-foreground pl-6">{i + 1}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        student.avatarColor
                      )}
                    >
                      {initials(`${student.firstName} ${student.lastName}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {student.lastName}, {student.firstName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {student.guardianName}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground font-mono text-xs">
                  {student.regNumber}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{student.classLevel}</Badge>
                </TableCell>

                <TableCell>
                  <Badge variant={enrollmentStatusVariant[student.status]}>
                    {enrollmentStatusLabel[student.status]}
                  </Badge>
                </TableCell>

                <TableCell
                  className={cn(
                    "text-right font-medium",
                    student.feeBalance > 0 ? "text-rose-600" : "text-emerald-600"
                  )}
                >
                  {formatCurrency(student.feeBalance)}
                </TableCell>

                <TableCell className="pr-6 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`View ${student.firstName} ${student.lastName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(student);
                    }}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-16 text-center">
                  <p className="font-medium">
                    {hasRecords || isFiltered
                      ? "No students found"
                      : "No student records yet"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {hasRecords || isFiltered
                      ? "Try a different search term or clear your filters."
                      : "Connect a data source, or enroll a student to get started."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-muted-foreground mt-4 text-sm">
        Showing {filtered.length} of {students.length} students
      </p>

      <StudentProfileDialog
        student={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}

function ClassPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

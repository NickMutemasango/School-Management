"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TermEntryData } from "@/lib/teacher/reports";
import { saveClassTermRemark, saveSubjectResults } from "@/app/teacher/reports/actions";

interface TermEntryViewProps {
  term: string;
  academicYear: number;
  data: TermEntryData;
}

export function TermEntryView({ term, academicYear, data }: TermEntryViewProps) {
  return (
    <div className="space-y-6">
      {data.classes.map((cls) => (
        <SubjectCard
          key={cls.classTeacherSubjectId}
          cls={cls}
          term={term}
          academicYear={academicYear}
        />
      ))}

      {data.remarks.map((remark) => (
        <RemarkCard
          key={remark.classId}
          remark={remark}
          term={term}
          academicYear={academicYear}
        />
      ))}
    </div>
  );
}

function SubjectCard({
  cls,
  term,
  academicYear,
}: {
  cls: TermEntryData["classes"][number];
  term: string;
  academicYear: number;
}) {
  const [rows, setRows] = React.useState(cls.roster);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function updateRow(studentId: string, patch: { mark?: number | null; comment?: string }) {
    setSaved(false);
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r))
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSubjectResults(
          cls.classTeacherSubjectId,
          term,
          academicYear,
          rows.map((r) => ({ studentId: r.studentId, mark: r.mark, comment: r.comment }))
        );
        setError(null);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between border-b py-5">
        <CardTitle className="flex items-center gap-2">
          {cls.subject}
          <Badge variant="secondary">{cls.classLabel}</Badge>
        </CardTitle>
        <Button size="sm" disabled={isPending} onClick={handleSave}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead className="w-28">Mark (%)</TableHead>
              <TableHead>Comment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.studentId}>
                <TableCell>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">{row.regNumber}</p>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={row.mark ?? ""}
                    onChange={(e) =>
                      updateRow(row.studentId, {
                        mark: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="—"
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.comment}
                    onChange={(e) => updateRow(row.studentId, { comment: e.target.value })}
                    placeholder="Optional comment"
                  />
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No students in this class yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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

function RemarkCard({
  remark,
  term,
  academicYear,
}: {
  remark: TermEntryData["remarks"][number];
  term: string;
  academicYear: number;
}) {
  const [comment, setComment] = React.useState(remark.comment);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function handleSave() {
    startTransition(async () => {
      try {
        await saveClassTermRemark(remark.classId, term, academicYear, comment);
        setError(null);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle className="flex items-center gap-2">
          Class Teacher Remark
          <Badge variant="secondary">{remark.classLabel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        <p className="text-muted-foreground text-xs">
          Shared across every subject teacher in this class - whoever saves last wins.
        </p>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Overall remark for this class, this term..."
          className="bg-background w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10"
        />
        <div className="flex items-center gap-3">
          <Button size="sm" disabled={isPending} onClick={handleSave}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saved ? "Saved" : "Save"}
          </Button>
          {error && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

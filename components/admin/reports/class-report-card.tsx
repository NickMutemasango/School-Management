import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isPass, type GradeBand } from "@/lib/data/student-results";
import { cn } from "@/lib/utils";
import type { AdminClassReport } from "@/lib/admin/reports";

export function ClassReportCard({ report, bands }: { report: AdminClassReport; bands: GradeBand[] }) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>{report.classLabel}</CardTitle>
        <CardDescription>
          {report.students.length} student{report.students.length === 1 ? "" : "s"} &middot;{" "}
          {report.subjectOrder.length} subject{report.subjectOrder.length === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">#</TableHead>
              <TableHead>Student</TableHead>
              {report.subjectOrder.map((subject) => (
                <TableHead key={subject} className="text-right">
                  {subject}
                </TableHead>
              ))}
              <TableHead className="text-right">Average</TableHead>
              <TableHead className="pr-6 text-right">Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.students.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell className="text-muted-foreground pl-6">
                  {student.position ?? "—"}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">{student.regNumber}</p>
                </TableCell>
                {student.subjects.map((s) => (
                  <TableCell
                    key={s.subject}
                    className={cn(
                      "text-right font-medium tabular-nums",
                      s.mark === null
                        ? "text-muted-foreground"
                        : isPass(s.mark, bands)
                          ? "text-emerald-600"
                          : "text-rose-600"
                    )}
                  >
                    {s.mark ?? "—"}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold tabular-nums">
                  {student.average ?? "—"}
                </TableCell>
                <TableCell className="pr-6 text-right font-medium tabular-nums">
                  {student.position ?? "—"}
                </TableCell>
              </TableRow>
            ))}

            {report.students.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={report.subjectOrder.length + 4} className="py-10 text-center">
                  <p className="text-muted-foreground text-sm">No students enrolled in this class.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {report.classTeacherComment && (
        <div className="border-t px-6 py-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Class Teacher&rsquo;s Comment
          </p>
          <p className="mt-1 text-sm">{report.classTeacherComment}</p>
        </div>
      )}
    </Card>
  );
}

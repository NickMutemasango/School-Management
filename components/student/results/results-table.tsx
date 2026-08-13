import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  gradeForMark,
  gradeToneClass,
  isPass,
  type SubjectResult,
} from "@/lib/data/student-results";

export function ResultsTable({ subjects }: { subjects: SubjectResult[] }) {
  return (
    <div className="bg-background overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Subject</TableHead>
            <TableHead className="text-right">Mark</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-right">Position</TableHead>
            <TableHead className="pr-6">Teacher&rsquo;s Comment</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {subjects.map((s) => {
            const grade = gradeForMark(s.mark);
            return (
              <TableRow key={s.id}>
                <TableCell className="pl-6 font-medium">{s.subject}</TableCell>

                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    isPass(s.mark) ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {s.mark}%
                </TableCell>

                <TableCell className="text-center">
                  <span
                    className={cn(
                      "inline-grid size-7 place-items-center rounded-lg text-xs font-bold",
                      gradeToneClass[grade]
                    )}
                  >
                    {grade}
                  </span>
                </TableCell>

                <TableCell className="text-right text-slate-500 tabular-nums dark:text-slate-400">
                  {s.classPosition}
                  <span className="text-slate-400"> / {s.classSize}</span>
                </TableCell>

                <TableCell className="pr-6 whitespace-normal text-slate-600 dark:text-slate-300">
                  {s.teacherComment || (
                    <span className="text-slate-400">&mdash;</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

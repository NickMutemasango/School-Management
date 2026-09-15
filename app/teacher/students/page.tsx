import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRosterForTeacher, type RosterStudent } from "@/lib/teacher/roster";
import { CLASS_LEVELS } from "@/lib/data/class-levels";

export const metadata: Metadata = {
  title: "My Students · Teacher Portal",
  description: "Students enrolled in the classes you teach.",
};

interface ClassGroup {
  level: string;
  section: string;
  students: RosterStudent[];
}

/**
 * One group per level+section, ordered by CLASS_LEVELS then section - a
 * teacher assigned to multiple sections of the same grade (or multiple
 * grades) sees each class kept separate rather than interleaved into one
 * undifferentiated list.
 */
function groupByClass(students: RosterStudent[]): ClassGroup[] {
  const groups = new Map<string, ClassGroup>();
  for (const student of students) {
    const key = `${student.level}|${student.section}`;
    const group = groups.get(key);
    if (group) {
      group.students.push(student);
    } else {
      groups.set(key, { level: student.level, section: student.section, students: [student] });
    }
  }

  return [...groups.values()].sort((a, b) => {
    const levelDiff = CLASS_LEVELS.indexOf(a.level as (typeof CLASS_LEVELS)[number]) -
      CLASS_LEVELS.indexOf(b.level as (typeof CLASS_LEVELS)[number]);
    return levelDiff !== 0 ? levelDiff : a.section.localeCompare(b.section);
  });
}

export default async function TeacherStudentsPage() {
  const students = await getRosterForTeacher();
  const groups = groupByClass(students);

  return (
    <>
      <PageHeader
        title="My Students"
        description="Students enrolled in the classes you teach."
      />

      {groups.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground py-8 text-center text-sm">
              No students have been added to your classes yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={`${group.level}-${group.section}`}>
              <CardHeader>
                <CardTitle>
                  {group.level} · {group.section}
                </CardTitle>
                <CardDescription>
                  {group.students.length} student{group.students.length === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Registration No.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.regNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

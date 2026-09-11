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
import { getRosterForTeacher } from "@/lib/teacher/roster";

export const metadata: Metadata = {
  title: "My Students · Teacher Portal",
  description: "Students enrolled in the classes you teach.",
};

export default async function TeacherStudentsPage() {
  const students = await getRosterForTeacher();

  return (
    <>
      <PageHeader
        title="My Students"
        description="Students enrolled in the classes you teach."
      />

      <Card>
        <CardHeader>
          <CardTitle>Students ({students.length})</CardTitle>
          <CardDescription>You can only see students in your assigned classes.</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No students have been added to your classes yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Registration No.</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.regNumber}</TableCell>
                    <TableCell>
                      {student.level} · {student.section}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyClass } from "@/lib/students/classmates";

export const metadata: Metadata = {
  title: "My Class · Student Portal",
  description: "Your classmates and the teachers assigned to your class.",
};

export default async function MyClassPage() {
  const user = await getCurrentUser();
  const myClass = user ? await getMyClass(user.id) : null;

  return (
    <>
      <PageHeader
        title="My Class"
        description={
          myClass
            ? `${myClass.level} · ${myClass.section}`
            : "Your classmates and the teachers assigned to your class."
        }
      />

      {!myClass ? (
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={Users}
            title="Not assigned to a class yet"
            description="An admin hasn't placed you in a class section yet."
          />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teachers &amp; Subjects</CardTitle>
              <CardDescription>Who teaches what in your class.</CardDescription>
            </CardHeader>
            <CardContent>
              {myClass.teachers.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No teachers assigned to your class yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {myClass.teachers.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-800"
                    >
                      <Badge variant="secondary">{t.subject}</Badge>
                      <span className="font-medium">{t.teacherName}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classmates ({myClass.classmates.length})</CardTitle>
              <CardDescription>
                Other students in {myClass.level} · {myClass.section}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myClass.classmates.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No other students in your class yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Registration No.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myClass.classmates.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {c.firstName} {c.lastName}
                        </TableCell>
                        <TableCell>{c.regNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  School,
  ShieldCheck,
  Users,
  UserCheck,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/data/class-levels";

export const metadata: Metadata = {
  title: "Dashboard · Administration",
  description: "Portal-wide overview and key metrics.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: staffData }, { data: studentsData }, { data: classesData }, { data: assignmentsData }] =
    await Promise.all([
      supabase.from("profiles").select("role, status").in("role", ["admin", "teacher"]),
      supabase.from("students").select("class_level"),
      supabase.from("classes").select("id"),
      supabase.from("class_teacher_subjects").select("class_id"),
    ]);

  const staff = staffData ?? [];
  const staffStats = {
    total: staff.filter((s) => s.status !== "pending").length,
    pending: staff.filter((s) => s.status === "pending").length,
    admins: staff.filter((s) => s.role === "admin" && s.status === "active").length,
    teachers: staff.filter((s) => s.role === "teacher" && s.status === "active").length,
  };

  const students = studentsData ?? [];
  const enrollmentByLevel = new Map<string, number>();
  for (const level of CLASS_LEVELS) enrollmentByLevel.set(level, 0);
  for (const row of students) {
    enrollmentByLevel.set(row.class_level, (enrollmentByLevel.get(row.class_level) ?? 0) + 1);
  }

  const classes = classesData ?? [];
  const assignedClassIds = new Set((assignmentsData ?? []).map((a) => a.class_id));
  const classesWithoutTeacher = classes.filter((c) => !assignedClassIds.has(c.id)).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Portal-wide overview and key metrics."
      />

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Staff & Users</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Staff"
              value={String(staffStats.total)}
              caption="Admins + teachers"
              icon={Users}
              tone="blue"
            />
            <StatCard
              label="Pending Approvals"
              value={String(staffStats.pending)}
              caption={
                staffStats.pending > 0 ? (
                  <Link href="/admin/users" className="text-blue-600 hover:underline dark:text-blue-400">
                    Review in Users →
                  </Link>
                ) : (
                  "Nothing waiting"
                )
              }
              icon={UserCheck}
              tone={staffStats.pending > 0 ? "amber" : "emerald"}
            />
            <StatCard
              label="Admins"
              value={String(staffStats.admins)}
              caption="Active"
              icon={ShieldCheck}
              tone="violet"
            />
            <StatCard
              label="Teachers"
              value={String(staffStats.teachers)}
              caption="Active"
              icon={GraduationCap}
              tone="emerald"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Students</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Enrolled"
              value={String(students.length)}
              caption="All class levels"
              icon={GraduationCap}
              tone="blue"
            />
          </div>

          <Card className="mt-5">
            <CardHeader className="border-b py-5">
              <CardTitle>Enrollment by Level</CardTitle>
              <CardDescription>Students currently registered at each class level.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CLASS_LEVELS.map((level) => (
                  <div
                    key={level}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{level}</span>
                    <Badge variant="secondary">{enrollmentByLevel.get(level)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Classes</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Classes"
              value={String(classes.length)}
              caption="Level + section combinations"
              icon={School}
              tone="blue"
            />
            <StatCard
              label="Without a Teacher"
              value={String(classesWithoutTeacher)}
              caption={
                classesWithoutTeacher > 0 ? (
                  <Link href="/admin/classes" className="text-blue-600 hover:underline dark:text-blue-400">
                    Assign in Classes →
                  </Link>
                ) : (
                  "Full coverage"
                )
              }
              icon={AlertTriangle}
              tone={classesWithoutTeacher > 0 ? "rose" : "emerald"}
            />
            <StatCard
              label="Subject Assignments"
              value={String((assignmentsData ?? []).length)}
              caption="Teacher-class-subject links"
              icon={BookOpen}
              tone="violet"
            />
          </div>
        </section>
      </div>
    </>
  );
}

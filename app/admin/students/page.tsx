import type { Metadata } from "next";
import { GraduationCap, UserCheck, UserMinus, UserX } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StudentDirectory } from "@/components/admin/student-directory";
import { createClient } from "@/lib/supabase/server";
import { avatarColorFor } from "@/lib/utils";
import type { Student } from "@/lib/data/students";

export const metadata: Metadata = {
  title: "Student Directory · Administration",
  description: "Active, inactive, and deregistered students grouped by class.",
};

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  const students: Student[] = (data ?? []).map((row) => ({
    id: row.id,
    regNumber: row.reg_number,
    firstName: row.first_name,
    lastName: row.last_name,
    classLevel: row.class_level,
    status: row.status,
    gender: row.gender,
    dateOfBirth: row.date_of_birth ?? "",
    enrolledOn: row.enrolled_on,
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    guardianEmail: row.guardian_email,
    address: row.address,
    feeBalance: Number(row.fee_balance),
    attendanceRate: Number(row.attendance_rate),
    avatarColor: avatarColorFor(row.id),
  }));

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    inactive: students.filter((s) => s.status === "inactive").length,
    deregistered: students.filter((s) => s.status === "deregistered").length,
  };

  return (
    <>
      <PageHeader
        title="Student Directory"
        description="Active, inactive, and deregistered students grouped by class."
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={String(stats.total)}
          caption="All enrollment states"
          icon={GraduationCap}
          tone="blue"
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          caption="Currently enrolled"
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          caption="Temporarily withdrawn"
          icon={UserMinus}
          tone="amber"
        />
        <StatCard
          label="Deregistered"
          value={String(stats.deregistered)}
          caption="Removed from the register"
          icon={UserX}
          tone="rose"
        />
      </div>

      <StudentDirectory students={students} />
    </>
  );
}

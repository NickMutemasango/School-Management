import { GraduationCap, UserCheck, UserMinus, UserX } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StudentDirectory } from "@/components/admin/student-directory";
import { studentStats } from "@/lib/data/students";

export default function StudentsPage() {
  return (
    <>
      <PageHeader
        title="Student Directory"
        description="Active, inactive, and deregistered students grouped by class."
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={String(studentStats.total)}
          caption="All enrollment states"
          icon={GraduationCap}
          tone="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Active"
          value={String(studentStats.active)}
          caption="Currently enrolled"
          icon={UserCheck}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Inactive"
          value={String(studentStats.inactive)}
          caption="Temporarily withdrawn"
          icon={UserMinus}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Deregistered"
          value={String(studentStats.deregistered)}
          caption="Removed from the register"
          icon={UserX}
          tone="bg-rose-50 text-rose-600"
        />
      </div>

      <StudentDirectory />
    </>
  );
}

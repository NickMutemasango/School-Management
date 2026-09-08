import type { Metadata } from "next";

import { StudentGreeting } from "@/components/student/dashboard/student-greeting";
import { StudentStatGrid } from "@/components/student/dashboard/student-stat-grid";
import { QuickLinks } from "@/components/student/dashboard/quick-links";
import { studentStats as emptyStats } from "@/lib/data/student";
import {
  getCurrentStudentRow,
  toStudentProfile,
  toStudentStats,
} from "@/lib/students/current-student";

export const metadata: Metadata = {
  title: "Dashboard · Student Portal",
  description: "Your results, notes, and fees at a glance.",
};

export default async function StudentDashboardPage() {
  const row = await getCurrentStudentRow();
  const profile = row ? toStudentProfile(row) : null;
  const stats = row ? toStudentStats(row) : emptyStats;

  return (
    <div className="space-y-8">
      <StudentGreeting
        name={profile ? `${profile.firstName} ${profile.lastName}` : ""}
        classLevel={profile?.classLevel ?? ""}
        regNumber={profile?.regNumber ?? ""}
      />

      <StudentStatGrid stats={stats} />

      <QuickLinks />
    </div>
  );
}

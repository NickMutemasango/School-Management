import type { Metadata } from "next";

import { StudentGreeting } from "@/components/student/dashboard/student-greeting";
import { StudentStatGrid } from "@/components/student/dashboard/student-stat-grid";
import { QuickLinks } from "@/components/student/dashboard/quick-links";
import { SubjectCards } from "@/components/student/class/subject-cards";
import { studentStats as emptyStats } from "@/lib/data/student";
import {
  getCurrentStudentRow,
  toStudentProfile,
  toStudentStats,
} from "@/lib/students/current-student";
import { getMySubjects } from "@/lib/students/classmates";
import { getSelectedClassSubjectId } from "@/lib/students/selected-class";

export const metadata: Metadata = {
  title: "Dashboard · Student Portal",
  description: "Your results, notes, and fees at a glance.",
};

export default async function StudentDashboardPage() {
  const row = await getCurrentStudentRow();
  const profile = row ? toStudentProfile(row) : null;
  const stats = row ? toStudentStats(row) : emptyStats;

  const [subjects, selectedId] = await Promise.all([
    row ? getMySubjects() : Promise.resolve([]),
    getSelectedClassSubjectId(),
  ]);

  return (
    <div className="space-y-8">
      <StudentGreeting
        name={profile ? `${profile.firstName} ${profile.lastName}` : ""}
        classLevel={profile?.classLevel ?? ""}
        regNumber={profile?.regNumber ?? ""}
      />

      <StudentStatGrid stats={stats} />

      {row && <SubjectCards teachers={subjects} selectedId={selectedId} />}

      <QuickLinks />
    </div>
  );
}

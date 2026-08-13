import type { Metadata } from "next";

import { StudentGreeting } from "@/components/student/dashboard/student-greeting";
import { StudentStatGrid } from "@/components/student/dashboard/student-stat-grid";
import { QuickLinks } from "@/components/student/dashboard/quick-links";
import {
  studentFullName,
  studentProfile,
  studentStats,
} from "@/lib/data/student";

export const metadata: Metadata = {
  title: "Dashboard — Student Portal",
  description: "Your results, notes, and fees at a glance.",
};

export default function StudentDashboardPage() {
  return (
    <div className="space-y-8">
      <StudentGreeting
        name={studentFullName}
        classLevel={studentProfile.classLevel}
        regNumber={studentProfile.regNumber}
      />

      <StudentStatGrid stats={studentStats} />

      <QuickLinks />
    </div>
  );
}

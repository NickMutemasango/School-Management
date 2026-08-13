import type { Metadata } from "next";

import { TeacherGreeting } from "@/components/teacher/dashboard/teacher-greeting";
import { TeacherStatGrid } from "@/components/teacher/dashboard/teacher-stat-grid";
import { TodaysSchedule } from "@/components/teacher/dashboard/todays-schedule";
import { teacherProfile, teacherStats, todaysSchedule } from "@/lib/data/teacher";

export const metadata: Metadata = {
  title: "Dashboard — Teacher Portal",
  description: "Your teaching day at a glance.",
};

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      <TeacherGreeting
        name={teacherProfile.name}
        department={teacherProfile.department}
      />

      <TeacherStatGrid stats={teacherStats} />

      <TodaysSchedule slots={todaysSchedule} />
    </div>
  );
}

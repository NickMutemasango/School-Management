import type { Metadata } from "next";

import { TeacherGreeting } from "@/components/teacher/dashboard/teacher-greeting";
import { TeacherStatGrid } from "@/components/teacher/dashboard/teacher-stat-grid";
import { TodaysSchedule } from "@/components/teacher/dashboard/todays-schedule";
import { teacherStats, todaysSchedule, deriveTodaysSchedule } from "@/lib/data/teacher";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentTeacherStats } from "@/lib/teacher/current-teacher-stats";
import { getTimetableForTeacher } from "@/lib/teacher/timetable";

export const metadata: Metadata = {
  title: "Dashboard · Teacher Portal",
  description: "Your teaching day at a glance.",
};

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();
  // Falls back to the mock stats only for the signed-out edge case
  // middleware already guards against.
  const entries = user ? await getTimetableForTeacher(user.id) : [];
  const stats = user ? await getCurrentTeacherStats(user.id, entries) : teacherStats;
  const slots = user ? deriveTodaysSchedule(entries) : todaysSchedule;

  return (
    <div className="space-y-8">
      {/* Department isn't tracked in `profiles` yet - blank until that lands. */}
      <TeacherGreeting name={user?.name ?? ""} department="" />

      <TeacherStatGrid stats={stats} />

      <TodaysSchedule slots={slots} />
    </div>
  );
}

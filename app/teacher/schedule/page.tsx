import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ScheduleView } from "@/components/teacher/schedule/schedule-view";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTimetableForTeacher } from "@/lib/teacher/timetable";

export const metadata: Metadata = {
  title: "Schedule · Teacher Portal",
  description: "Your weekly teaching timetable.",
};

export default async function TeacherSchedulePage() {
  const user = await getCurrentUser();
  const entries = user ? await getTimetableForTeacher(user.id) : [];

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Your weekly teaching timetable across all classes."
      />
      <ScheduleView entries={entries} />
    </>
  );
}

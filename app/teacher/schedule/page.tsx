import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ScheduleView } from "@/components/teacher/schedule/schedule-view";

export const metadata: Metadata = {
  title: "Schedule — Teacher Portal",
  description: "Your weekly teaching timetable.",
};

export default function TeacherSchedulePage() {
  return (
    <>
      <PageHeader
        title="Schedule"
        description="Your weekly teaching timetable across all classes."
      />
      <ScheduleView />
    </>
  );
}

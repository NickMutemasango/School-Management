import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StudentNotesList } from "@/components/student/notes/student-notes-list";
import { getCurrentStudentRow } from "@/lib/students/current-student";
import { getNotesForLevel } from "@/lib/notes/fetch-notes";

export const metadata: Metadata = {
  title: "Class Notes · Student Portal",
  description: "Notes and resources shared by your teachers.",
};

export default async function StudentNotesPage() {
  const student = await getCurrentStudentRow();
  const notes = student ? await getNotesForLevel(student.class_level) : [];

  return (
    <>
      <PageHeader
        title="Class Notes"
        description={
          student?.class_level
            ? `Notes and resources shared with ${student.class_level}.`
            : "Notes and resources shared by your teachers."
        }
      />
      <StudentNotesList notes={notes} />
    </>
  );
}

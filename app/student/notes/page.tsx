import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StudentNotesList } from "@/components/student/notes/student-notes-list";
import { studentNotes } from "@/lib/data/student-notes";
import { studentProfile } from "@/lib/data/student";

export const metadata: Metadata = {
  title: "Class Notes — Student Portal",
  description: "Notes and resources shared by your teachers.",
};

export default function StudentNotesPage() {
  return (
    <>
      <PageHeader
        title="Class Notes"
        description={
          studentProfile.classLevel
            ? `Notes and resources shared with ${studentProfile.classLevel}.`
            : "Notes and resources shared by your teachers."
        }
      />
      <StudentNotesList notes={studentNotes} />
    </>
  );
}

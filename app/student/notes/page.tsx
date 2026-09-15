import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StudentNotesList } from "@/components/student/notes/student-notes-list";
import { NoClassSelected } from "@/components/student/no-class-selected";
import { getCurrentStudentRow } from "@/lib/students/current-student";
import { getClassSubjectForStudent } from "@/lib/students/classmates";
import { getNotesForLevel } from "@/lib/notes/fetch-notes";
import { getSelectedClassSubjectId } from "@/lib/students/selected-class";

export const metadata: Metadata = {
  title: "Class Notes · Student Portal",
  description: "Notes and resources shared by your teachers.",
};

export default async function StudentNotesPage() {
  const student = await getCurrentStudentRow();
  const selectedId = await getSelectedClassSubjectId();
  // Validated, not just "is a cookie present" - see the same note in
  // app/student/assignments/page.tsx.
  const selectedSubject = selectedId ? await getClassSubjectForStudent(selectedId) : null;

  const notes =
    student && selectedSubject
      ? await getNotesForLevel(student.class_level, selectedSubject.subject)
      : [];

  return (
    <>
      <PageHeader
        title="Class Notes"
        description={
          selectedSubject
            ? `Notes and resources shared for ${selectedSubject.subject}.`
            : "Notes and resources shared by your teachers."
        }
      />
      {selectedSubject ? <StudentNotesList notes={notes} /> : <NoClassSelected what="notes" />}
    </>
  );
}

import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { NotesClassList } from "@/components/teacher/notes/notes-class-list";

export const metadata: Metadata = {
  title: "Class Notes — Teacher Portal",
  description: "Upload and manage teaching notes by class.",
};

export default function TeacherNotesPage() {
  return (
    <>
      <PageHeader
        title="Class Notes"
        description="Select a class to upload and manage notes"
      />
      <NotesClassList />
    </>
  );
}

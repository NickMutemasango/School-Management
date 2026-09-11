import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { NotesClassList } from "@/components/teacher/notes/notes-class-list";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAssignedClassesForTeacher } from "@/lib/teacher/assigned-classes";

export const metadata: Metadata = {
  title: "Class Notes · Teacher Portal",
  description: "Upload and manage teaching notes by class.",
};

export default async function TeacherNotesPage() {
  const user = await getCurrentUser();
  const classes = user ? await getAssignedClassesForTeacher(user.id) : [];

  return (
    <>
      <PageHeader
        title="Class Notes"
        description="Select a class to upload and manage notes"
      />
      <NotesClassList classes={classes} />
    </>
  );
}

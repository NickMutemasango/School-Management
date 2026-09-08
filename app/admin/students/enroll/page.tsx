import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EnrollmentForm } from "@/components/admin/enrollment-form";

export const metadata: Metadata = {
  title: "Enroll Student · Administration",
  description: "Capture a new student enrollment.",
};

export default function EnrollStudentPage() {
  return (
    <>
      <PageHeader
        title="Enroll Student"
        description="Capture a new student record and assign them to a class and fee profile."
      />
      <EnrollmentForm />
    </>
  );
}

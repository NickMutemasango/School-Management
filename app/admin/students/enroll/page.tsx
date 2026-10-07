import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EnrollmentForm } from "@/components/admin/enrollment-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Enroll Student · Administration",
  description: "Capture a new student enrollment.",
};

export default async function EnrollStudentPage() {
  const supabase = await createClient();

  // school_level_offerings' RLS already scopes this to the caller's own
  // school - see /admin/levels for where a school activates a level.
  const { data: offeringsData } = await supabase
    .from("school_level_offerings")
    .select("level_definitions(display_label, sort_order)")
    .eq("academic_year", new Date().getFullYear())
    .eq("status", "active");

  const offeringRows = (offeringsData ?? []) as unknown as Array<{
    level_definitions: { display_label: string; sort_order: number } | null;
  }>;
  const levels = offeringRows
    .filter((row) => row.level_definitions !== null)
    .sort((a, b) => a.level_definitions!.sort_order - b.level_definitions!.sort_order)
    .map((row) => row.level_definitions!.display_label);

  return (
    <>
      <PageHeader
        title="Enroll Student"
        description="Capture a new student record and assign them to a class and fee profile."
      />
      <EnrollmentForm levels={levels} />
    </>
  );
}

import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { LevelConfiguration, type LevelRow } from "@/components/admin/level-configuration";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Levels · Administration",
  description: "Activate the curriculum levels this school offers.",
};

export default async function LevelsPage() {
  const supabase = await createClient();
  const academicYear = new Date().getFullYear();

  const [{ data: levelDefinitions }, { data: offerings }] = await Promise.all([
    supabase.from("level_definitions").select("id, display_label, sort_order").order("sort_order"),
    supabase
      .from("school_level_offerings")
      .select("id, level_definition_id, status")
      .eq("academic_year", academicYear),
  ]);

  const offeringByLevel = new Map(
    (offerings ?? []).map((o) => [o.level_definition_id, { id: o.id, status: o.status }])
  );

  const levels: LevelRow[] = (levelDefinitions ?? []).map((ld) => {
    const offering = offeringByLevel.get(ld.id);
    return {
      levelDefinitionId: ld.id,
      displayLabel: ld.display_label,
      active: offering?.status === "active",
      offeringId: offering?.id ?? null,
    };
  });

  return (
    <>
      <PageHeader
        title="Levels"
        description={`Activate the curriculum levels this school offers for ${academicYear}. Only activated levels appear when creating a class or enrolling a student.`}
      />
      <LevelConfiguration levels={levels} academicYear={academicYear} />
    </>
  );
}

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_GRADE_BANDS, type GradeBand } from "@/lib/data/student-results";

/**
 * Readable by every school member via grade_bands_select_member (migration
 * 0023) - students need their own school's bands to render their results'
 * grades, not just admins. Falls back to DEFAULT_GRADE_BANDS if a school
 * somehow has no rows, so a missing config can never hide every grade.
 */
export async function getGradeBands(): Promise<GradeBand[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("grade_bands")
    .select("grade, min_mark")
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) return DEFAULT_GRADE_BANDS;
  return data.map((row) => ({ grade: row.grade as GradeBand["grade"], min: Number(row.min_mark) }));
}

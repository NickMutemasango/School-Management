import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export interface ParentChild {
  id: string;
  firstName: string;
  lastName: string;
  regNumber: string;
  classLevel: string;
}

interface ChildRow {
  id: string;
  first_name: string;
  last_name: string;
  reg_number: string;
  class_level: string;
}

/**
 * Every student linked to the signed-in parent via parent_students
 * (migration 0024) - `cache()`-wrapped for the same reason as
 * getCurrentStudentRow, since the layout and each page both need this.
 */
export const getChildrenForParent = cache(async (): Promise<ParentChild[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("parent_students")
    .select("students(id, first_name, last_name, reg_number, class_level)")
    .eq("parent_profile_id", user.id);

  const rows = (data ?? []) as unknown as Array<{ students: ChildRow | null }>;

  return rows
    .map((row) => row.students)
    .filter((s): s is ChildRow => s !== null)
    .map((s) => ({
      id: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      regNumber: s.reg_number,
      classLevel: s.class_level,
    }));
});

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Runs as the signed-in user - notification_reads_insert_own (migration
 * 0022) is the only authorization check, since "mark this notification
 * read for myself" has no ownership question beyond that. Upsert with
 * ignoreDuplicates so re-dismissing an already-read key is a silent no-op
 * rather than a unique-constraint error.
 */
export async function markNotificationsRead(keys: string[]) {
  if (keys.length === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();
  if (!profile) return;

  await supabase.from("notification_reads").upsert(
    keys.map((key) => ({
      user_id: user.id,
      school_id: profile.school_id,
      notification_key: key,
    })),
    { onConflict: "user_id,notification_key", ignoreDuplicates: true }
  );
}

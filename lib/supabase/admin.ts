import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for privileged operations only: creating student
 * accounts at enrollment, approving staff sign-ups, etc. Bypasses Row Level
 * Security, so it must never be imported into a Client Component or exposed
 * to the browser — server actions and route handlers only.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

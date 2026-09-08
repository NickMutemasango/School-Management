"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
}

/**
 * No self-update RLS policy exists on `students` (see migration 0003) - a
 * broad policy would let a student rewrite class_level or fee_balance via a
 * direct API call. Instead this authenticates the caller normally, then
 * writes through the service-role client scoped to their own id and this
 * fixed column list.
 */
export async function updateOwnProfile(input: UpdateProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await createAdminClient()
    .from("students")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      date_of_birth: input.dateOfBirth || null,
      gender: input.gender || null,
      address: input.address,
      guardian_name: input.guardianName,
      guardian_phone: input.guardianPhone,
      guardian_email: input.guardianEmail,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

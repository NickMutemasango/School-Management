"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { studentAuthEmail } from "@/lib/auth/student-email";
import { generateTempPassword } from "@/lib/auth/generate-password";
import { CLASS_LEVELS } from "@/lib/data/students";

export interface EnrollState {
  error: string | null;
  success: { regNumber: string; tempPassword: string; fullName: string } | null;
}

/** "REG-2026-0001", sequential per calendar year. */
async function nextRegNumber(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  const prefix = `REG-${new Date().getFullYear()}-`;
  const { count } = await admin
    .from("students")
    .select("id", { count: "exact", head: true })
    .ilike("reg_number", `${prefix}%`);

  return `${prefix}${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function enrollStudent(
  _prev: EnrollState,
  formData: FormData
): Promise<EnrollState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const dateOfBirth = String(formData.get("dob") ?? "");
  const classLevel = String(formData.get("classLevel") ?? "");
  const enrolledOn = String(formData.get("enrolledOn") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim();

  if (!firstName || !lastName || !classLevel || !dateOfBirth || !enrolledOn || !guardianName) {
    return { error: "Fill in all required fields.", success: null };
  }
  if (!(CLASS_LEVELS as readonly string[]).includes(classLevel)) {
    return { error: "Select a valid class level.", success: null };
  }

  const admin = createAdminClient();
  const regNumber = await nextRegNumber(admin);
  const tempPassword = generateTempPassword();
  const fullName = `${firstName} ${lastName}`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: studentAuthEmail(regNumber),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return {
      error: createError?.message ?? "Could not create the student account.",
      success: null,
    };
  }

  // The sign-up trigger always creates new profiles as teacher/pending (see
  // migration 0004) - only this admin-gated, service-role call is trusted
  // to promote a fresh account straight to an active student.
  const { error: promoteError } = await admin
    .from("profiles")
    .update({ role: "student", status: "active" })
    .eq("id", created.user.id);

  if (promoteError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: promoteError.message, success: null };
  }

  const { error: insertError } = await admin.from("students").insert({
    id: created.user.id,
    reg_number: regNumber,
    first_name: firstName,
    last_name: lastName,
    class_level: classLevel,
    gender: gender || null,
    date_of_birth: dateOfBirth,
    enrolled_on: enrolledOn,
    address,
    guardian_name: guardianName,
    guardian_phone: guardianPhone,
    guardian_email: guardianEmail,
  });

  if (insertError) {
    // Don't leave a login with no student record behind it.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: insertError.message, success: null };
  }

  return { error: null, success: { regNumber, tempPassword, fullName } };
}

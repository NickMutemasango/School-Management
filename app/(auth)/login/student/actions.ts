"use server";

import { redirect } from "next/navigation";

import { studentAuthEmail } from "@/lib/auth/student-email";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";

export interface StudentLoginState {
  error: string | null;
}

export async function signInStudent(
  _prevState: StudentLoginState,
  formData: FormData
): Promise<StudentLoginState> {
  const regNumber = String(formData.get("regNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!regNumber || !password) {
    return { error: "Enter your registration number and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: studentAuthEmail(regNumber),
    password,
  });

  if (error) {
    return { error: "Incorrect registration number or password." };
  }

  redirect(safeNextPath(String(formData.get("next") ?? "")) ?? "/student");
}

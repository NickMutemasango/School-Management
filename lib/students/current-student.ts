import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { StudentProfile, StudentStats } from "@/lib/data/student";

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  reg_number: string;
  class_level: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  enrolled_on: string;
  fee_balance: number;
  attendance_rate: number;
}

// `cache()`-wrapped for the same reason as `getCurrentUser` - several
// student pages call this directly in addition to whatever PortalShell
// already fetched, and each uncached call repeats a real network round-trip
// to Supabase's auth server.
/** The signed-in student's own `students` row, or null if signed out. */
export const getCurrentStudentRow = cache(async (): Promise<StudentRow | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("students").select("*").eq("id", user.id).single();
  return data;
});

export function toStudentProfile(row: StudentRow): StudentProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    regNumber: row.reg_number,
    classLevel: row.class_level,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth ?? "",
    gender: row.gender ?? "",
    address: row.address,
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    guardianEmail: row.guardian_email,
    enrolledOn: row.enrolled_on,
  };
}

/** termAverage/notesAvailable stay 0 until results/notes tables exist. */
export function toStudentStats(row: StudentRow): StudentStats {
  return {
    feeBalance: Number(row.fee_balance),
    termAverage: 0,
    attendanceRate: Number(row.attendance_rate),
    notesAvailable: 0,
  };
}

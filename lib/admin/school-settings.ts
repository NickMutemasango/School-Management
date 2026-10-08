import { createClient } from "@/lib/supabase/server";

export interface SchoolSettings {
  address: string;
  contactEmail: string;
  contactPhone: string;
  academicYearStartMonth: number;
  notifyAdminsOnStaffSignup: boolean;
}

const FALLBACK: SchoolSettings = {
  address: "",
  contactEmail: "",
  contactPhone: "",
  academicYearStartMonth: 1,
  notifyAdminsOnStaffSignup: true,
};

/** Every school has exactly one row, seeded by migration 0023 - FALLBACK only covers a lookup error. */
export async function getSchoolSettings(): Promise<SchoolSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_settings")
    .select("address, contact_email, contact_phone, academic_year_start_month, notify_admins_on_staff_signup")
    .maybeSingle();

  if (!data) return FALLBACK;

  return {
    address: data.address,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    academicYearStartMonth: data.academic_year_start_month,
    notifyAdminsOnStaffSignup: data.notify_admins_on_staff_signup,
  };
}

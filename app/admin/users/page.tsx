import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { UsersTable, type StaffProfile } from "@/components/admin/users-table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Users · Administration",
  description: "Manage portal accounts and role assignments.",
};

export default async function UsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, created_at")
    .in("role", ["admin", "teacher"])
    .order("created_at", { ascending: false });

  const profiles: StaffProfile[] = (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  }));

  const pending = profiles.filter((p) => p.status === "pending");
  const staff = profiles.filter((p) => p.status !== "pending");

  return (
    <>
      <PageHeader
        title="Users"
        description="Approve new staff sign-ups and manage who has admin or teacher access."
      />
      <UsersTable pending={pending} staff={staff} />
    </>
  );
}

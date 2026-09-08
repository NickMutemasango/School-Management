import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ProfileHeader } from "@/components/student/personal-details/profile-header";
import {
  PersonalDetailsForm,
  RegistryDetails,
} from "@/components/student/personal-details/personal-details-form";
import { studentProfile as emptyProfile } from "@/lib/data/student";
import { getCurrentStudentRow, toStudentProfile } from "@/lib/students/current-student";

export const metadata: Metadata = {
  title: "Personal Details · Student Portal",
  description: "Review and update your contact and guardian information.",
};

export default async function StudentPersonalDetailsPage() {
  const row = await getCurrentStudentRow();
  const profile = row ? toStudentProfile(row) : emptyProfile;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <>
      <PageHeader
        title="Personal Details"
        description="Keep your contact and guardian information up to date."
      />

      <ProfileHeader
        name={fullName}
        classLevel={profile.classLevel}
        regNumber={profile.regNumber}
      />

      <div className="space-y-5">
        <PersonalDetailsForm profile={profile} />
        <RegistryDetails profile={profile} />
      </div>
    </>
  );
}

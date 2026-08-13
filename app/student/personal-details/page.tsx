import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ProfileHeader } from "@/components/student/personal-details/profile-header";
import {
  PersonalDetailsForm,
  RegistryDetails,
} from "@/components/student/personal-details/personal-details-form";
import { studentFullName, studentProfile } from "@/lib/data/student";

export const metadata: Metadata = {
  title: "Personal Details — Student Portal",
  description: "Review and update your contact and guardian information.",
};

export default function StudentPersonalDetailsPage() {
  return (
    <>
      <PageHeader
        title="Personal Details"
        description="Keep your contact and guardian information up to date."
      />

      <ProfileHeader
        name={studentFullName}
        classLevel={studentProfile.classLevel}
        regNumber={studentProfile.regNumber}
      />

      <div className="space-y-5">
        <PersonalDetailsForm profile={studentProfile} />
        <RegistryDetails profile={studentProfile} />
      </div>
    </>
  );
}

import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { SchoolProfileForm } from "@/components/admin/settings/school-profile-form";
import { GradeBandsForm } from "@/components/admin/settings/grade-bands-form";
import { NotificationPreferencesForm } from "@/components/admin/settings/notification-preferences-form";
import { getSchoolSettings } from "@/lib/admin/school-settings";
import { getGradeBands } from "@/lib/admin/grade-bands";

export const metadata: Metadata = {
  title: "Settings · Administration",
  description: "School profile, grading bands, and notification preferences.",
};

export default async function SettingsPage() {
  const [settings, bands] = await Promise.all([getSchoolSettings(), getGradeBands()]);

  return (
    <>
      <PageHeader
        title="Settings"
        description="School profile, grading bands, and notification preferences."
      />

      <div className="space-y-6">
        <SchoolProfileForm settings={settings} />
        <GradeBandsForm bands={bands} />
        <NotificationPreferencesForm notifyAdminsOnStaffSignup={settings.notifyAdminsOnStaffSignup} />
      </div>
    </>
  );
}

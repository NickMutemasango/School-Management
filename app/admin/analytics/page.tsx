import type { Metadata } from "next";
import { AlertTriangle, Banknote, GraduationCap, PiggyBank, TrendingUp, UserCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  EnrollmentByLevelChart,
  EnrollmentTrendChart,
  StaffBreakdownChart,
} from "@/components/admin/analytics/enrollment-charts";
import { AverageByLevelChart, GradeDistributionChart } from "@/components/admin/analytics/academic-charts";
import { FinanceByTermChart } from "@/components/admin/analytics/finance-analytics-chart";
import { getAcademicAnalytics, getEnrollmentAnalytics, getFinanceAnalytics } from "@/lib/admin/analytics";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Analytics · Administration",
  description: "Trends across enrolment, academics, and revenue.",
};

export default async function AnalyticsPage() {
  const [enrollment, academic, finance] = await Promise.all([
    getEnrollmentAnalytics(),
    getAcademicAnalytics(),
    getFinanceAnalytics(),
  ]);

  return (
    <>
      <PageHeader title="Analytics" description="Trends across enrolment, academics, and revenue." />

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Enrollment & Staffing</h2>
          <div className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Students" value={String(enrollment.totalStudents)} caption="All class levels" icon={GraduationCap} tone="blue" />
            <StatCard label="Active Staff" value={String(enrollment.activeStaff)} caption="Admins + teachers" icon={UserCheck} tone="emerald" />
            <StatCard
              label="Pending Approvals"
              value={String(enrollment.pendingStaff)}
              caption="Awaiting review"
              icon={UserCheck}
              tone={enrollment.pendingStaff > 0 ? "amber" : "emerald"}
            />
            <StatCard
              label="Classes Without a Teacher"
              value={String(enrollment.classesWithoutTeacher)}
              caption="Need an assignment"
              icon={AlertTriangle}
              tone={enrollment.classesWithoutTeacher > 0 ? "rose" : "emerald"}
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EnrollmentByLevelChart data={enrollment.byLevel} />
            </div>
            <StaffBreakdownChart data={enrollment.staffBreakdown} />
          </div>
          <div className="mt-5">
            <EnrollmentTrendChart data={enrollment.byMonth} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Academic Performance</h2>
          <p className="text-muted-foreground -mt-2 mb-5 text-sm">
            {academic.term}, {academic.academicYear}
          </p>
          <div className="mb-5 grid gap-5 sm:grid-cols-3">
            <StatCard label="Pass Rate" value={`${academic.passRate}%`} caption="Grade C or better" icon={TrendingUp} tone="emerald" />
            <StatCard label="Overall Average" value={`${academic.overallAverage}%`} caption="Every saved subject mark" icon={GraduationCap} tone="blue" />
            <StatCard label="Marks Recorded" value={String(academic.gradedCount)} caption="This term, so far" icon={GraduationCap} tone="violet" />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <AverageByLevelChart data={academic.averageByLevel} />
            <GradeDistributionChart data={academic.gradeDistribution} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Finance</h2>
          <div className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Billed" value={formatCurrency(finance.totalBilled)} caption="Invoices issued" icon={Banknote} tone="blue" />
            <StatCard label="Collected" value={formatCurrency(finance.totalCollected)} caption="Payments received" icon={Banknote} tone="emerald" />
            <StatCard label="Outstanding" value={formatCurrency(finance.outstanding)} caption="Awaiting settlement" icon={PiggyBank} tone="rose" />
            <StatCard label="Collection Rate" value={`${finance.collectionRate}%`} caption="Collected over billed" icon={TrendingUp} tone="amber" />
          </div>
          <FinanceByTermChart data={finance.byTerm} />
        </section>
      </div>
    </>
  );
}

import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/data/class-levels";
import { TERM_LABELS, currentAcademicYear, currentTerm } from "@/lib/data/terms";
import { gradeForMark, isPass, type Grade } from "@/lib/data/student-results";
import { getGradeBands } from "@/lib/admin/grade-bands";

export interface EnrollmentByLevel {
  level: string;
  students: number;
}

export interface EnrollmentByMonth {
  month: string;
  cumulative: number;
}

export interface StaffBreakdown {
  name: string;
  value: number;
}

export interface EnrollmentAnalytics {
  totalStudents: number;
  activeStaff: number;
  pendingStaff: number;
  classesWithoutTeacher: number;
  byLevel: EnrollmentByLevel[];
  byMonth: EnrollmentByMonth[];
  staffBreakdown: StaffBreakdown[];
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Enrollment/staffing figures the dashboard already shows as static counts
 * (app/admin/dashboard/page.tsx), plus two trend/breakdown cuts the
 * dashboard doesn't: cumulative enrollment by month (from students.enrolled_on)
 * and a staff role/status breakdown.
 */
export async function getEnrollmentAnalytics(): Promise<EnrollmentAnalytics> {
  const supabase = await createClient();
  const year = currentAcademicYear();

  const [{ data: staffData }, { data: studentsData }, { data: classesData }, { data: assignmentsData }] =
    await Promise.all([
      supabase.from("profiles").select("role, status").in("role", ["admin", "teacher"]),
      supabase.from("students").select("class_level, enrolled_on"),
      supabase.from("classes").select("id"),
      supabase.from("class_teacher_subjects").select("class_id"),
    ]);

  const staff = staffData ?? [];
  const students = studentsData ?? [];
  const classes = classesData ?? [];
  const assignedClassIds = new Set((assignmentsData ?? []).map((a) => a.class_id));

  const byLevelMap = new Map<string, number>();
  for (const level of CLASS_LEVELS) byLevelMap.set(level, 0);
  for (const row of students) {
    byLevelMap.set(row.class_level, (byLevelMap.get(row.class_level) ?? 0) + 1);
  }
  const byLevel: EnrollmentByLevel[] = CLASS_LEVELS.map((level) => ({
    level,
    students: byLevelMap.get(level) ?? 0,
  })).filter((row) => row.students > 0);

  const enrolledByMonth = new Array(12).fill(0);
  for (const row of students) {
    const d = new Date(row.enrolled_on);
    if (d.getFullYear() === year) enrolledByMonth[d.getMonth()]++;
  }
  let running = 0;
  const byMonth: EnrollmentByMonth[] = MONTH_LABELS.map((month, i) => {
    running += enrolledByMonth[i];
    return { month, cumulative: running };
  }).filter((_, i) => enrolledByMonth.slice(0, i + 1).some((c) => c > 0));

  const activeStaff = staff.filter((s) => s.status === "active");
  const staffBreakdown: StaffBreakdown[] = [
    { name: "Admins", value: activeStaff.filter((s) => s.role === "admin").length },
    { name: "Teachers", value: activeStaff.filter((s) => s.role === "teacher").length },
    { name: "Pending", value: staff.filter((s) => s.status === "pending").length },
  ].filter((d) => d.value > 0);

  return {
    totalStudents: students.length,
    activeStaff: activeStaff.length,
    pendingStaff: staff.filter((s) => s.status === "pending").length,
    classesWithoutTeacher: classes.filter((c) => !assignedClassIds.has(c.id)).length,
    byLevel,
    byMonth,
    staffBreakdown,
  };
}

export interface AverageByLevel {
  level: string;
  average: number;
}

export interface GradeDistributionSlice {
  grade: Grade;
  count: number;
}

export interface AcademicAnalytics {
  term: string;
  academicYear: number;
  gradedCount: number;
  passRate: number;
  overallAverage: number;
  averageByLevel: AverageByLevel[];
  gradeDistribution: GradeDistributionSlice[];
}

/**
 * Pulled from subject_results for the current term/year only - a school-wide
 * snapshot of "how did this term go", not a historical trend (there's no
 * concept of "academic year over year" comparison yet, same single-calendar
 * simplification as lib/data/terms.ts).
 */
export async function getAcademicAnalytics(): Promise<AcademicAnalytics> {
  const supabase = await createClient();
  const term = currentTerm();
  const academicYear = currentAcademicYear();

  const [{ data: classesData }, { data: resultsData }, bands] = await Promise.all([
    supabase.from("classes").select("id, level"),
    supabase
      .from("subject_results")
      .select("mark, class_teacher_subjects(class_id)")
      .eq("term", term)
      .eq("academic_year", academicYear),
    getGradeBands(),
  ]);

  const levelByClass = new Map((classesData ?? []).map((c) => [c.id, c.level]));
  const rows = (resultsData ?? []) as unknown as Array<{
    mark: number;
    class_teacher_subjects: { class_id: string } | null;
  }>;

  const marksByLevel = new Map<string, number[]>();
  const allMarks: number[] = [];
  for (const row of rows) {
    const mark = Number(row.mark);
    allMarks.push(mark);
    const classId = row.class_teacher_subjects?.class_id;
    const level = classId ? levelByClass.get(classId) : undefined;
    if (!level) continue;
    const list = marksByLevel.get(level) ?? [];
    list.push(mark);
    marksByLevel.set(level, list);
  }

  const averageByLevel: AverageByLevel[] = CLASS_LEVELS.map((level): AverageByLevel | null => {
    const marks = marksByLevel.get(level);
    if (!marks || marks.length === 0) return null;
    return { level, average: Math.round((marks.reduce((s, m) => s + m, 0) / marks.length) * 10) / 10 };
  }).filter((row): row is AverageByLevel => row !== null);

  const gradeCounts = new Map<Grade, number>();
  for (const mark of allMarks) {
    const grade = gradeForMark(mark, bands);
    gradeCounts.set(grade, (gradeCounts.get(grade) ?? 0) + 1);
  }
  const gradeDistribution: GradeDistributionSlice[] = (["A", "B", "C", "D", "E", "U"] as Grade[])
    .map((grade) => ({ grade, count: gradeCounts.get(grade) ?? 0 }))
    .filter((d) => d.count > 0);

  const passCount = allMarks.filter((m) => isPass(m, bands)).length;

  return {
    term,
    academicYear,
    gradedCount: allMarks.length,
    passRate: allMarks.length > 0 ? Math.round((passCount / allMarks.length) * 100) : 0,
    overallAverage:
      allMarks.length > 0 ? Math.round((allMarks.reduce((s, m) => s + m, 0) / allMarks.length) * 10) / 10 : 0,
    averageByLevel,
    gradeDistribution,
  };
}

export interface FinanceByTerm {
  term: string;
  billed: number;
  collected: number;
}

export interface FinanceAnalytics {
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  collectionRate: number;
  byTerm: FinanceByTerm[];
}

/**
 * Same billed/collected/outstanding math as app/admin/finance/page.tsx, cut
 * by term instead of by month - a complementary view, not a duplicate of
 * the Finance Overview page's monthly trend.
 */
export async function getFinanceAnalytics(): Promise<FinanceAnalytics> {
  const supabase = await createClient();

  const [{ data: invoiceRows }, { data: paymentRows }] = await Promise.all([
    supabase.from("invoices").select("id, amount, term, voided_at"),
    supabase.from("payments").select("invoice_id, amount"),
  ]);

  const billedInvoices = (invoiceRows ?? []).filter((i) => i.voided_at === null);
  const billedInvoiceIds = new Set(billedInvoices.map((i) => i.id));
  const validPayments = (paymentRows ?? []).filter((p) => billedInvoiceIds.has(p.invoice_id));

  const totalBilled = billedInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalCollected = validPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const paidByInvoice = new Map<string, number>();
  for (const p of validPayments) {
    paidByInvoice.set(p.invoice_id, (paidByInvoice.get(p.invoice_id) ?? 0) + Number(p.amount));
  }

  const byTermMap = new Map<string, { billed: number; collected: number }>();
  for (const label of TERM_LABELS) byTermMap.set(label, { billed: 0, collected: 0 });
  for (const inv of billedInvoices) {
    const entry = byTermMap.get(inv.term) ?? { billed: 0, collected: 0 };
    entry.billed += Number(inv.amount);
    entry.collected += paidByInvoice.get(inv.id) ?? 0;
    byTermMap.set(inv.term, entry);
  }

  const byTerm: FinanceByTerm[] = TERM_LABELS.map((term) => ({
    term,
    billed: Math.round((byTermMap.get(term)?.billed ?? 0) * 100) / 100,
    collected: Math.round((byTermMap.get(term)?.collected ?? 0) * 100) / 100,
  })).filter((row) => row.billed > 0 || row.collected > 0);

  return {
    totalBilled,
    totalCollected,
    outstanding: totalBilled - totalCollected,
    collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
    byTerm,
  };
}

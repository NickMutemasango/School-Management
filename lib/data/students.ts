/**
 * Student data contract.
 *
 * Types, enums, and display mappings only — there are no records here yet.
 * Replace the empty `students` export with a backend query (e.g.
 * `useQuery(api.students.list)`); keep the `Student` type as the contract so
 * the directory, profile modal, and enrollment form keep compiling.
 */

import { CLASS_LEVELS, type ClassLevel } from "@/lib/data/class-levels";

export { CLASS_LEVELS, type ClassLevel };

export type EnrollmentStatus = "active" | "inactive" | "deregistered";

export interface Student {
  id: string;
  regNumber: string;
  firstName: string;
  lastName: string;
  classLevel: ClassLevel;
  status: EnrollmentStatus;
  gender: "Male" | "Female";
  dateOfBirth: string;
  enrolledOn: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  feeBalance: number;
  attendanceRate: number;
  /** Tailwind classes for the avatar chip, e.g. "bg-blue-100 text-blue-700". */
  avatarColor: string;
}

export const students: Student[] = [];

export const enrollmentStatusLabel: Record<EnrollmentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  deregistered: "Deregistered",
};

/** Maps an enrollment status onto a Badge variant. */
export const enrollmentStatusVariant: Record<
  EnrollmentStatus,
  "success" | "warning" | "danger"
> = {
  active: "success",
  inactive: "warning",
  deregistered: "danger",
};

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  deregistered: number;
}

/** Derived from `students`, so this zeroes out until records exist. */
export const studentStats: StudentStats = {
  total: students.length,
  active: students.filter((s) => s.status === "active").length,
  inactive: students.filter((s) => s.status === "inactive").length,
  deregistered: students.filter((s) => s.status === "deregistered").length,
};

export interface ClassEnrollment {
  level: string;
  students: number;
}

/** Head-count per class band, for the Student Management overview chart. */
export const enrollmentByClass: ClassEnrollment[] = [];

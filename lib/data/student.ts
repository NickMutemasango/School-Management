/**
 * Student portal data contract.
 *
 * Types only - records are empty until a backend is connected. Every student
 * component reads from these exports, so swapping them for queries is the
 * whole integration.
 */

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  regNumber: string;
  classLevel: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  enrolledOn: string;
}

/**
 * Signed-in student. Empty until an auth provider is wired up - the sidebar
 * and greeting fall back to a signed-out state.
 */
export const studentProfile: StudentProfile = {
  id: "",
  firstName: "",
  lastName: "",
  regNumber: "",
  classLevel: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  enrolledOn: "",
};

/** Full display name, or an empty string when signed out. */
export const studentFullName = [studentProfile.firstName, studentProfile.lastName]
  .filter(Boolean)
  .join(" ");

export interface StudentStats {
  /** Outstanding fees in USD. */
  feeBalance: number;
  /** Running term average as a percentage. */
  termAverage: number;
  /** Attendance rate as a percentage. */
  attendanceRate: number;
  /** Note files available to download across all subjects. */
  notesAvailable: number;
}

export const studentStats: StudentStats = {
  feeBalance: 0,
  termAverage: 0,
  attendanceRate: 0,
  notesAvailable: 0,
};

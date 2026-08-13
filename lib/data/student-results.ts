/**
 * Student results data contract.
 *
 * The grade scale is configuration (ZIMSEC-style bands) and stays populated;
 * `termResults` holds the actual marks and is empty until a backend exists.
 */

export type Grade = "A" | "B" | "C" | "D" | "E" | "U";

/** Lower bound of each grade band, highest first. */
const GRADE_BANDS: { grade: Grade; min: number }[] = [
  { grade: "A", min: 75 },
  { grade: "B", min: 65 },
  { grade: "C", min: 50 },
  { grade: "D", min: 40 },
  { grade: "E", min: 30 },
  { grade: "U", min: 0 },
];

export function gradeForMark(mark: number): Grade {
  return GRADE_BANDS.find((b) => mark >= b.min)?.grade ?? "U";
}

/** A pass is grade C or better. */
export function isPass(mark: number) {
  return mark >= 50;
}

export const gradeToneClass: Record<Grade, string> = {
  A: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  B: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  C: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  D: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  E: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  U: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
};

export interface SubjectResult {
  id: string;
  subject: string;
  /** Percentage, 0-100. */
  mark: number;
  /** Position within the class for this subject. */
  classPosition: number;
  classSize: number;
  teacherComment: string;
}

export interface TermResult {
  id: string;
  label: string;
  /** The most recently published term. */
  current: boolean;
  /** Overall average across subjects, as a percentage. */
  average: number;
  /** Overall position in the class. */
  position: number;
  classSize: number;
  classTeacherComment: string;
  headComment: string;
  subjects: SubjectResult[];
}

/** Published results per term, newest first. Empty until a backend exists. */
export const termResults: TermResult[] = [];

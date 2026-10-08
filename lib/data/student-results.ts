/**
 * Student results data contract.
 *
 * `termResults` holds the actual marks and is empty until a backend exists.
 * The grade scale itself now lives in the grade_bands table (migration
 * 0023, editable at /admin/settings) - lib/admin/grade-bands.ts is the real
 * source, this file's DEFAULT_GRADE_BANDS is only a fallback for callers
 * that don't pass bands through (and the value every school is seeded
 * with, so results render identically until an admin changes them).
 */

export type Grade = "A" | "B" | "C" | "D" | "E" | "U";

export interface GradeBand {
  grade: Grade;
  /** Lower bound (inclusive) of this band, as a percentage. */
  min: number;
}

/** Highest first - gradeForMark/isPass depend on this order. */
export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  { grade: "A", min: 75 },
  { grade: "B", min: 65 },
  { grade: "C", min: 50 },
  { grade: "D", min: 40 },
  { grade: "E", min: 30 },
  { grade: "U", min: 0 },
];

export function gradeForMark(mark: number, bands: GradeBand[] = DEFAULT_GRADE_BANDS): Grade {
  return bands.find((b) => mark >= b.min)?.grade ?? "U";
}

/** A pass is grade C or better - derived from the bands' own C threshold. */
export function isPass(mark: number, bands: GradeBand[] = DEFAULT_GRADE_BANDS) {
  const cThreshold = bands.find((b) => b.grade === "C")?.min ?? 50;
  return mark >= cThreshold;
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

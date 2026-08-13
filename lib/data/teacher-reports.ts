/**
 * End of Term Reports data contract.
 *
 * Types only - no term records or head-counts yet. Class levels come from
 * `class-levels.ts` (configuration), so the picker still lists every class;
 * the per-class figures and terms arrive with the backend.
 */

import { CLASS_LEVELS } from "./class-levels";

export interface ReportTerm {
  id: string;
  label: string;
  /** The term currently open for entry. */
  current: boolean;
  savedSubjects: number;
  pending: number;
}

export interface ReportClass {
  level: string;
  studentCount: number;
  terms: ReportTerm[];
}

export const reportClasses: ReportClass[] = CLASS_LEVELS.map((level) => ({
  level,
  studentCount: 0,
  terms: [],
}));

export function reportClassFor(level: string): ReportClass | undefined {
  return reportClasses.find((c) => c.level === level);
}

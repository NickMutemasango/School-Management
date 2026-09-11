/**
 * School-wide class levels, in the order the portal lists them: ECD, then
 * primary, then secondary. Matches Zimbabwe's education structure - ECD 'A'
 * (ages 3-4) and 'B' (ages 4-5), Grade 1-7 primary, Form 1-4 O-Level and
 * Form 5-6 A-Level secondary. Configuration rather than sample data - shared
 * by Class Notes, Assignments, End of Term Reports, and admin enrollment
 * (`lib/data/students.ts` re-exports this module rather than keeping its own
 * copy).
 */

export const CLASS_LEVELS = [
  "ECD A",
  "ECD B",
  "GRADE 1",
  "GRADE 2",
  "GRADE 3",
  "GRADE 4",
  "GRADE 5",
  "GRADE 6",
  "GRADE 7",
  "FORM 1",
  "FORM 2",
  "FORM 3",
  "FORM 4",
  "FORM 5",
  "FORM 6",
] as const;

export type ClassLevel = (typeof CLASS_LEVELS)[number];

/** "FORM 4" -> "form-4" */
export function levelSlug(level: string) {
  return level.toLowerCase().replace(/\s+/g, "-");
}

/** "form-4" -> "FORM 4", or undefined if the slug isn't a known level. */
export function levelFromSlug(slug: string): ClassLevel | undefined {
  return CLASS_LEVELS.find((l) => levelSlug(l) === slug);
}

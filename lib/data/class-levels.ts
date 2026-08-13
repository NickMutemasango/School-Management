/**
 * School-wide class levels, in the order the portal lists them.
 * Configuration rather than sample data - shared by Class Notes and
 * End of Term Reports.
 */

export const CLASS_LEVELS = [
  "ECD",
  "FORM 1",
  "FORM 2",
  "FORM 3",
  "FORM 4",
  "FORM 5",
  "FORM 6",
  "GRADE 1",
  "GRADE 2",
  "GRADE 3",
  "GRADE 4",
  "GRADE 5",
  "GRADE 6",
  "GRADE 7",
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

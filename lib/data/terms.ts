/**
 * Academic term configuration.
 *
 * There's no school-configurable term calendar yet (same "single-tenant,
 * one calendar" simplification as the rest of the app) - three fixed terms
 * per calendar year, with "current" resolved from Zimbabwe's school-year
 * bands (Term 1 Jan-Apr, Term 2 May-Aug, Term 3 Sep-Dec). A school-specific
 * calendar is a natural follow-up once there's a real onboarding flow.
 */

export const TERM_LABELS = ["Term 1", "Term 2", "Term 3"] as const;
export type TermLabel = (typeof TERM_LABELS)[number];

/** "Term 1" -> "term-1" */
export function termSlug(term: string) {
  return term.toLowerCase().replace(/\s+/g, "-");
}

/** "term-1" -> "Term 1", or undefined if the slug isn't a known term. */
export function termFromSlug(slug: string): TermLabel | undefined {
  return TERM_LABELS.find((t) => termSlug(t) === slug);
}

export function currentTerm(date = new Date()): TermLabel {
  const month = date.getMonth(); // 0-11
  if (month <= 3) return "Term 1";
  if (month <= 7) return "Term 2";
  return "Term 3";
}

export function currentAcademicYear(date = new Date()) {
  return date.getFullYear();
}

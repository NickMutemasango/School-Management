/**
 * Students authenticate with a registration number + password, but Supabase
 * Auth identities need an email. This derives a stable, email-safe address
 * from the reg number so the enrollment flow (which creates the account) and
 * the login flow (which signs into it) can never disagree.
 *
 * The address never receives mail - it exists only as an Auth identifier.
 */
export function studentAuthEmail(regNumber: string): string {
  const domain = process.env.STUDENT_AUTH_EMAIL_DOMAIN;
  if (!domain) {
    throw new Error("STUDENT_AUTH_EMAIL_DOMAIN is not set");
  }

  const local = regNumber
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${local}@${domain}`;
}

// Deliberately simple - just enough to reject obvious typos client-side
// validation would otherwise catch, since server actions can also be hit
// directly without going through the form's `type="email"` input.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NAME_MAX_LENGTH = 80;

export const PASSWORD_MIN_LENGTH = 8;
// GoTrue hashes passwords with bcrypt, which silently ignores bytes past 72 -
// reject upfront rather than let someone set a password that's truncated.
export const PASSWORD_MAX_LENGTH = 72;

/** bcrypt's 72-char limit is bytes, not JS string length - a password full of
 * multi-byte characters (emoji, CJK, accents) can be short in `.length` but
 * long in UTF-8 bytes. */
export function passwordByteLength(password: string): number {
  return new TextEncoder().encode(password).length;
}

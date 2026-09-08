/**
 * Only same-site relative paths are allowed as a post-login redirect target
 * (e.g. from an email link to a specific admin page) - guards against an
 * open redirect via a "//evil.com" or absolute-URL `next` value. Backslashes
 * are rejected outright rather than just "//" - browsers normalize a leading
 * "/\" the same as "//" when resolving a URL, so "/\evil.com" would
 * otherwise slip through as a scheme-relative redirect off-site.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}

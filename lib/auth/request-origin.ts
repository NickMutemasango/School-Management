import { headers } from "next/headers";

/**
 * The current request's origin (e.g. "https://yourdomain.com" or
 * "http://localhost:3000"), used to build OAuth/email redirect URLs that
 * work correctly whether the request came from local dev or production.
 *
 * The `Origin` header isn't guaranteed on every request - plain top-level
 * form POSTs (which is how signInWithGoogle/signUpStaffWithPassword are
 * invoked) don't send it consistently across browsers. Falling back to
 * "null/auth/callback" or "/auth/callback" produces a malformed redirectTo
 * that can never match Supabase's Redirect URLs allowlist, so Supabase
 * silently substitutes the dashboard's Site URL instead - which looks like
 * "it's always redirecting to the wrong place" with no error anywhere.
 * `Host` (or `x-forwarded-host` behind a proxy) is always present, so it's
 * the reliable fallback.
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();

  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    throw new Error("Could not determine the request origin (no Origin or Host header).");
  }

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");

  return `${proto}://${host}`;
}

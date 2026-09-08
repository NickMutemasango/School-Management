/**
 * Thin wrapper around Resend's REST API - no SDK dependency needed for one
 * call site. No-ops (logging instead) when RESEND_API_KEY isn't set, so
 * local dev without an email provider configured doesn't hard-fail auth.
 *
 * Returns whether the send actually succeeded, so callers that track
 * "already notified" state (see notify-admins.ts) don't mark something as
 * sent when Resend rejected it.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  if (to.length === 0) return false;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set - skipped "${subject}" to ${to.join(", ")}`);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Innovate Institute <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    console.error(`[email] Resend request failed (${response.status}): ${await response.text()}`);
    return false;
  }

  return true;
}

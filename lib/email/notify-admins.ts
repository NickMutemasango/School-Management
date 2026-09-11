import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./resend";

/** `fullName`/`email` here come from signup form input or the OAuth provider - escape before interpolating into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Emails every active admin when a new staff account is awaiting approval.
 * Uses the service-role client because the pending user's own session can't
 * read other people's profile rows under RLS.
 */
export async function notifyAdminsOfPendingStaff(
  pending: { fullName: string; email: string },
  origin: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: admins } = await admin
    .from("profiles")
    .select("email")
    .eq("role", "admin")
    .eq("status", "active");

  const to = (admins ?? []).map((a) => a.email).filter(Boolean);
  if (to.length === 0) return false;

  const displayName = escapeHtml(pending.fullName || pending.email);
  const safeEmail = escapeHtml(pending.email);
  // Deep-links straight to the approval page - if the admin isn't already
  // signed in, the middleware itself redirects to /login?next=/admin/users,
  // and the login flow carries that through to land back here afterward.
  const approveUrl = `${origin}/admin/users`;

  return sendEmail({
    to,
    subject: `New staff account awaiting approval: ${pending.fullName || pending.email}`,
    html: `
      <p><strong>${displayName}</strong> (${safeEmail}) just signed up for staff
      access and is waiting for admin approval.</p>
      <p style="margin: 24px 0;">
        <a href="${approveUrl}"
           style="display: inline-block; background-color: #2563eb; color: #ffffff;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; font-family: sans-serif;">
          Review &amp; approve
        </a>
      </p>
      <p style="color: #64748b; font-size: 13px;">
        Or paste this link into your browser: ${origin}/admin/users
      </p>
    `,
  });
}

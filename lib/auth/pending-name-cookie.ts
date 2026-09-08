/**
 * Shared between the staff sign-up action (which sets it) and the OAuth
 * callback (which reads it) - kept out of the "use server" actions file
 * since that file may only export async functions.
 */
export const PENDING_NAME_COOKIE = "pending_full_name";

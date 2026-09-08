import { randomInt } from "crypto";

// Excludes visually ambiguous characters (0/O, 1/l/I) since this gets
// read off a screen and typed in by a student.
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** A random temporary password issued at enrollment. */
export function generateTempPassword(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARS[randomInt(CHARS.length)];
  }
  return out;
}

/**
 * Class Notes uploaded per class level (teacher side).
 *
 * The shared shape lives in `notes.ts`; this module only holds the per-level
 * store. Replace `notesByLevel` with a query keyed by class level.
 */

import { CLASS_LEVELS } from "./class-levels";
import type { NoteFile } from "./notes";

/** Uploaded files per class level. Empty until a backend is connected. */
export const notesByLevel: Record<string, NoteFile[]> = Object.fromEntries(
  CLASS_LEVELS.map((level) => [level, [] as NoteFile[]])
);

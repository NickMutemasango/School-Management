/**
 * Class Notes shared with the signed-in student's class (read-only).
 *
 * Students download what their teachers have uploaded; they never upload here.
 * Replace `studentNotes` with a query scoped to the student's class level.
 */

import type { NoteFile } from "./notes";

/** Files available to the signed-in student. Empty until a backend exists. */
export const studentNotes: NoteFile[] = [];

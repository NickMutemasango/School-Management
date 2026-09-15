/**
 * Student-side view of Assignments.
 *
 * The teacher sets work against a class and sees every student's submission;
 * the student sees only their own. Both sides share the status enum, the
 * derivation, and the due-date helpers in `assignments.ts`, so "Late" and
 * "Due in 3 days" can't mean two different things across the portals - the
 * same split `notes.ts` uses for Class Notes. Only the wording and badge tone
 * differ, and those are audience-keyed maps in that shared module.
 *
 * Records come from `lib/students/assignments.ts`, scoped to the signed-in
 * student by RLS.
 */

import {
  submissionStatus,
  tallyStatuses,
  type StatusTally,
  type SubmissionStatus,
} from "./assignments";

export interface StudentSubmission {
  /** `assignment_submissions.id` - needed to request a download link. */
  id: string;
  fileName: string;
  fileSizeLabel: string;
  /** ISO date. */
  submittedOn: string;
  /** Optional message to the teacher. */
  note: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacherName: string;
  /** ISO due date. */
  dueOn: string;
  /** Brief shared by the teacher, or "" when there's no attachment. */
  briefFileName: string;
  /** Null until the student hands something in. */
  submission: StudentSubmission | null;
}

/**
 * The student's own status for one assignment, using the shared derivation so
 * "late" can't mean one thing here and another on the teacher's register.
 */
export function studentAssignmentStatus(
  assignment: StudentAssignment
): SubmissionStatus {
  return submissionStatus(
    assignment.submission?.submittedOn ?? "",
    assignment.dueOn
  );
}

/** "1.2 MB" - the picker gives real byte counts, so format them properly. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The student's list, tallied into the shared three buckets. */
export function tallyByStatus(assignments: StudentAssignment[]): StatusTally {
  return tallyStatuses(assignments.map(studentAssignmentStatus));
}

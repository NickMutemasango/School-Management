/**
 * Assignments contract.
 *
 * Types, the shared status vocabulary, and the due-date helpers — no teacher
 * records, matching the rest of `lib/data/`. Replace `assignmentsSeed` and
 * `CLASS_SIZES` with backend queries keyed by teacher id; keep the types as
 * the contract so the upload form and submissions viewer keep compiling.
 *
 * The student portal reads the status and date helpers from here too, so the
 * two sides can't drift — see `student-assignments.ts`, which does still ship
 * mock records for its own view.
 */

/**
 * The one submission-status vocabulary, shared by both portals.
 *
 * There are only three underlying facts - handed in on time, handed in after
 * the deadline, or not handed in - so there is one enum. What the two
 * audiences call the first state differs (a teacher reads "Not submitted",
 * the student reads "Pending"), and that split lives in the label/variant
 * maps below rather than in two competing enums.
 *
 * Derived from the submitted date vs. the due date - never stored.
 */
export type SubmissionStatus = "pending" | "submitted" | "late";

/** Who is reading the status - selects the wording and badge tone. */
export type StatusAudience = "teacher" | "student";

export interface Submission {
  id: string;
  studentName: string;
  regNumber: string;
  /** ISO date, or "" when the student hasn't handed anything in. */
  submittedOn: string;
  fileName: string;
  fileSizeLabel: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  /** Class level from `CLASS_LEVELS`, e.g. "FORM 4". */
  classLevel: string;
  /** ISO due date. */
  dueOn: string;
  /** Attached brief, or "" when the assignment is description-only. */
  fileName: string;
  submissions: Submission[];
}

/**
 * Roster head-count per class level, so the viewer can show "12 of 28
 * submitted". Empty until the class register is connected - `classSize`
 * returns undefined and the viewer falls back to the number of submissions
 * actually received.
 */
const CLASS_SIZES: Record<string, number> = {};

export function classSize(level: string): number | undefined {
  return CLASS_SIZES[level];
}

/**
 * Status is a function of the two dates so a hand-edited record can't claim
 * "Submitted" for a file that arrived a week after the deadline.
 */
export function submissionStatus(
  submittedOn: string,
  dueOn: string
): SubmissionStatus {
  if (!submittedOn) return "pending";
  if (!dueOn) return "submitted";
  return new Date(submittedOn) > new Date(dueOn) ? "late" : "submitted";
}

/**
 * Wording per audience. "Submitted" and "Late" read the same to everyone; only
 * the not-handed-in state needs different framing - it describes an absence to
 * the teacher and an outstanding task to the student.
 */
export const submissionStatusLabel: Record<
  StatusAudience,
  Record<SubmissionStatus, string>
> = {
  teacher: {
    pending: "Not submitted",
    submitted: "Submitted",
    late: "Late",
  },
  student: {
    pending: "Pending",
    submitted: "Submitted",
    late: "Late",
  },
};

/**
 * Badge tone per audience. Mirrors the mapping style used by `finance.ts` for
 * payment status. A missing submission is a neutral absence on the teacher's
 * register, but an actionable item on the student's own list.
 */
export const submissionStatusVariant: Record<
  StatusAudience,
  Record<SubmissionStatus, "success" | "warning" | "neutral" | "info">
> = {
  teacher: {
    pending: "neutral",
    submitted: "success",
    late: "warning",
  },
  student: {
    pending: "info",
    submitted: "success",
    late: "warning",
  },
};

/** Icon-chip tones, matching the portals' dashboard tile palette. */
export const submissionStatusTone: Record<SubmissionStatus, string> = {
  pending: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  submitted:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  late: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
};

export interface StatusTally {
  pending: number;
  submitted: number;
  late: number;
  /** Every status counted. */
  total: number;
  /** Handed in at all, on time or not. */
  received: number;
}

/** Counts a list of statuses - both portals tally the same three buckets. */
export function tallyStatuses(statuses: SubmissionStatus[]): StatusTally {
  const pending = statuses.filter((s) => s === "pending").length;
  const submitted = statuses.filter((s) => s === "submitted").length;
  const late = statuses.filter((s) => s === "late").length;

  return {
    pending,
    submitted,
    late,
    total: statuses.length,
    received: submitted + late,
  };
}

/** One assignment's submissions, tallied for the teacher's viewer. */
export function tallySubmissions(assignment: Assignment): StatusTally {
  return tallyStatuses(
    assignment.submissions.map((s) =>
      submissionStatus(s.submittedOn, assignment.dueOn)
    )
  );
}

/** Whole days until the due date; negative once it has passed. */
export function daysUntilDue(dueOn: string, now = new Date()): number | null {
  if (!dueOn) return null;
  const due = new Date(dueOn);
  if (Number.isNaN(due.getTime())) return null;

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  return Math.round(
    (startOfDay(due) - startOfDay(now)) / (1000 * 60 * 60 * 24)
  );
}

/** "Due in 3 days" / "Due today" / "Closed 2 days ago" */
export function dueLabel(dueOn: string, now = new Date()): string {
  const days = daysUntilDue(dueOn, now);
  if (days === null) return "No due date";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days} days`;
  if (days === -1) return "Closed yesterday";
  return `Closed ${Math.abs(days)} days ago`;
}

/**
 * Assignments set by the signed-in teacher. Empty until a backend is
 * connected - the viewer renders its empty state, and anything posted through
 * the form lives in `useState` for the session only.
 */
export const assignmentsSeed: Assignment[] = [];

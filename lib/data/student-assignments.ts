/**
 * Student-side view of Assignments.
 *
 * The teacher sets work against a class and sees every student's submission;
 * the student sees only their own. Both sides share the due-date helpers in
 * `assignments.ts` so "Due in 3 days" can't mean two different things - the
 * same split `notes.ts` uses for Class Notes.
 *
 * NOTE: ships populated mock records for the UI-only build. Replace
 * `studentAssignmentsSeed` with a query scoped to the signed-in student.
 */

/** What the student sees on their own work. */
export type StudentAssignmentStatus = "pending" | "submitted" | "late";

export interface StudentSubmission {
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
 * Derived, never stored - a submission dated after the deadline is late no
 * matter what a record claims.
 */
export function studentAssignmentStatus(
  assignment: StudentAssignment
): StudentAssignmentStatus {
  const { submission, dueOn } = assignment;
  if (!submission) return "pending";
  if (!dueOn) return "submitted";
  return new Date(submission.submittedOn) > new Date(dueOn)
    ? "late"
    : "submitted";
}

export const studentAssignmentStatusLabel: Record<
  StudentAssignmentStatus,
  string
> = {
  pending: "Pending",
  submitted: "Submitted",
  late: "Late",
};

/** Mirrors the mapping style used by `finance.ts` for payment status. */
export const studentAssignmentStatusVariant: Record<
  StudentAssignmentStatus,
  "info" | "success" | "warning"
> = {
  pending: "info",
  submitted: "success",
  late: "warning",
};

/** Icon-chip tones, matching the student dashboard's tile palette. */
export const studentAssignmentStatusTone: Record<
  StudentAssignmentStatus,
  string
> = {
  pending: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  submitted:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  late: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
};

/** "1.2 MB" - the picker gives real byte counts, so format them properly. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface StatusTally {
  all: number;
  pending: number;
  submitted: number;
  late: number;
}

export function tallyByStatus(assignments: StudentAssignment[]): StatusTally {
  const statuses = assignments.map(studentAssignmentStatus);
  return {
    all: assignments.length,
    pending: statuses.filter((s) => s === "pending").length,
    submitted: statuses.filter((s) => s === "submitted").length,
    late: statuses.filter((s) => s === "late").length,
  };
}

/** Mock records for the UI-only build. See the module note above. */
export const studentAssignmentsSeed: StudentAssignment[] = [
  {
    id: "sasg_001",
    title: "Quadratic Equations — Problem Set 4",
    description:
      "Complete questions 1 to 15 from the worksheet. Show all working; answers alone will not earn full marks.",
    subject: "Mathematics",
    teacherName: "Mr. Chirwa",
    dueOn: "2026-08-28",
    briefFileName: "problem-set-4.pdf",
    submission: null,
  },
  {
    id: "sasg_002",
    title: "Forces and Motion — Lab Report",
    description:
      "Write up the trolley-and-ramp experiment from Tuesday's practical. Include your results table, a velocity-time graph, and a short conclusion.",
    subject: "Physics",
    teacherName: "Mrs. Banda",
    dueOn: "2026-08-18",
    briefFileName: "lab-report-template.docx",
    submission: {
      fileName: "forces-lab-report.pdf",
      fileSizeLabel: "2.8 MB",
      submittedOn: "2026-08-21",
      note: "Sorry this is late Mrs Banda — I was away sick on Monday.",
    },
  },
  {
    id: "sasg_003",
    title: "The Cold War — Source Analysis",
    description:
      "Read the three sources in the handout and answer the comparison question in no more than 600 words.",
    subject: "History",
    teacherName: "Mr. Moyo",
    dueOn: "2026-08-20",
    briefFileName: "cold-war-sources.pdf",
    submission: {
      fileName: "cold-war-essay.docx",
      fileSizeLabel: "412 KB",
      submittedOn: "2026-08-19",
      note: "",
    },
  },
  {
    id: "sasg_004",
    title: "Reaction Rates — Revision Questions",
    description:
      "Answer the ten short-response questions in your exercise book, then photograph the pages and upload them as a single file.",
    subject: "Chemistry",
    teacherName: "Mrs. Banda",
    dueOn: "2026-08-25",
    briefFileName: "",
    submission: null,
  },
  {
    id: "sasg_005",
    title: "Descriptive Writing — Coursework Draft",
    description:
      "First draft of your descriptive piece (600–900 words). Bring a printed copy to Thursday's lesson as well.",
    subject: "English Language",
    teacherName: "Ms. Dube",
    dueOn: "2026-09-08",
    briefFileName: "coursework-brief.pdf",
    submission: null,
  },
];

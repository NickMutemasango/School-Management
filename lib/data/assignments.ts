/**
 * Teacher Assignments contract.
 *
 * NOTE: unlike every other module in `lib/data/`, this one ships populated
 * mock records. Step 1 is a UI-only build, so the submissions viewer needs
 * something to render. When the backend lands, empty `assignmentsSeed` and
 * replace it with a query keyed by teacher id — the types below are the
 * contract and nothing in `components/teacher/assignments/` reads the seed
 * directly (the page owns it as `useState`).
 */

/** Derived from the submitted date vs. the due date - never stored. */
export type SubmissionStatus = "submitted" | "late" | "missing";

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
 * Mock roster sizes, so the viewer can show "12 of 28 submitted". Replace with
 * a head-count from the class register; unknown levels fall back to the number
 * of submissions actually received.
 */
const CLASS_SIZES: Record<string, number> = {
  ECD: 22,
  "GRADE 1": 30,
  "GRADE 2": 29,
  "GRADE 3": 33,
  "GRADE 4": 31,
  "GRADE 5": 28,
  "GRADE 6": 27,
  "GRADE 7": 26,
  "FORM 1": 35,
  "FORM 2": 34,
  "FORM 3": 31,
  "FORM 4": 28,
  "FORM 5": 21,
  "FORM 6": 19,
};

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
  if (!submittedOn) return "missing";
  if (!dueOn) return "submitted";
  return new Date(submittedOn) > new Date(dueOn) ? "late" : "submitted";
}

export const submissionStatusLabel: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  late: "Late",
  missing: "Not submitted",
};

/** Mirrors the mapping style used by `finance.ts` for payment status. */
export const submissionStatusVariant: Record<
  SubmissionStatus,
  "success" | "warning" | "neutral"
> = {
  submitted: "success",
  late: "warning",
  missing: "neutral",
};

export interface SubmissionTally {
  submitted: number;
  late: number;
  missing: number;
  /** Handed in at all, on time or not. */
  received: number;
}

export function tallySubmissions(assignment: Assignment): SubmissionTally {
  const statuses = assignment.submissions.map((s) =>
    submissionStatus(s.submittedOn, assignment.dueOn)
  );

  const submitted = statuses.filter((s) => s === "submitted").length;
  const late = statuses.filter((s) => s === "late").length;
  const missing = statuses.filter((s) => s === "missing").length;

  return { submitted, late, missing, received: submitted + late };
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

/** Mock records for the UI-only build. See the module note above. */
export const assignmentsSeed: Assignment[] = [
  {
    id: "asg_001",
    title: "Quadratic Equations — Problem Set 4",
    description:
      "Complete questions 1 to 15 from the worksheet. Show all working; answers alone will not earn full marks.",
    classLevel: "FORM 4",
    dueOn: "2026-08-28",
    fileName: "problem-set-4.pdf",
    submissions: [
      {
        id: "sub_001",
        studentName: "Moyo, Tanaka",
        regNumber: "R261701a",
        submittedOn: "2026-08-22",
        fileName: "tanaka-pset4.pdf",
        fileSizeLabel: "1.2 MB",
      },
      {
        id: "sub_002",
        studentName: "Ncube, Rutendo",
        regNumber: "R261702b",
        submittedOn: "2026-08-23",
        fileName: "rutendo-pset4.docx",
        fileSizeLabel: "840 KB",
      },
      {
        id: "sub_003",
        studentName: "Chikwature, Farai",
        regNumber: "R261703c",
        submittedOn: "",
        fileName: "",
        fileSizeLabel: "",
      },
      {
        id: "sub_004",
        studentName: "Sibanda, Nomsa",
        regNumber: "R261704d",
        submittedOn: "2026-08-24",
        fileName: "nomsa-pset4.pdf",
        fileSizeLabel: "2.1 MB",
      },
    ],
  },
  {
    id: "asg_002",
    title: "Forces and Motion — Lab Report",
    description:
      "Write up the trolley-and-ramp experiment from Tuesday's practical. Include your results table, a velocity-time graph, and a short conclusion.",
    classLevel: "FORM 4",
    dueOn: "2026-08-18",
    fileName: "lab-report-template.docx",
    submissions: [
      {
        id: "sub_005",
        studentName: "Dube, Tapiwa",
        regNumber: "R261705e",
        submittedOn: "2026-08-17",
        fileName: "tapiwa-lab-report.pdf",
        fileSizeLabel: "3.4 MB",
      },
      {
        id: "sub_006",
        studentName: "Marange, Kudzai",
        regNumber: "R261706f",
        submittedOn: "2026-08-21",
        fileName: "kudzai-lab-report.pdf",
        fileSizeLabel: "2.8 MB",
      },
      {
        id: "sub_007",
        studentName: "Zulu, Anesu",
        regNumber: "R261707g",
        submittedOn: "",
        fileName: "",
        fileSizeLabel: "",
      },
    ],
  },
  {
    id: "asg_003",
    title: "Photosynthesis — Revision Questions",
    description:
      "Answer the ten short-response questions in your exercise book, then photograph the pages and upload them as a single file.",
    classLevel: "FORM 2",
    dueOn: "2026-09-04",
    fileName: "",
    submissions: [],
  },
];

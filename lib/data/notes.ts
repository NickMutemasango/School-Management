/**
 * Shared Class Notes contract.
 *
 * Both portals read the same shape: teachers upload files against a class
 * level, students download the files shared with their class. Keeping one
 * `NoteFile` type here stops the two sides drifting apart.
 */

export type ExamBody = "ZIMSEC" | "Cambridge" | "Internal";

/** Options for the upload form - configuration, not sample data. */
export const EXAM_BODIES: ExamBody[] = ["ZIMSEC", "Cambridge", "Internal"];

export const SUBJECTS = [
  "Accounting",
  "Biology",
  "Business Studies",
  "Chemistry",
  "Combined Science",
  "Computer Science",
  "English Language",
  "Geography",
  "History",
  "Mathematics",
  "Physics",
  "Shona",
] as const;

export interface NoteFile {
  id: string;
  name: string;
  subject: string;
  examBody: ExamBody;
  /** Short display date, e.g. "18 Jun". */
  uploadedOn: string;
  sizeLabel: string;
}

export interface SubjectGroup {
  subject: string;
  examBody: ExamBody;
  files: NoteFile[];
}

/** Files grouped by subject, in alphabetical order. */
export function groupBySubject(files: NoteFile[]): SubjectGroup[] {
  const map = new Map<string, SubjectGroup>();

  files.forEach((file) => {
    const existing = map.get(file.subject);
    if (existing) {
      existing.files.push(file);
    } else {
      map.set(file.subject, {
        subject: file.subject,
        examBody: file.examBody,
        files: [file],
      });
    }
  });

  return [...map.values()].sort((a, b) => a.subject.localeCompare(b.subject));
}

export const examBodyClass: Record<ExamBody, string> = {
  ZIMSEC: "bg-orange-500 text-white",
  Cambridge: "bg-blue-600 text-white",
  Internal: "bg-slate-500 text-white",
};

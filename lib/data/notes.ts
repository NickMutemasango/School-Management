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
  /** Teacher-entered display name - may have no extension at all. */
  name: string;
  subject: string;
  examBody: ExamBody;
  /** Short display date, e.g. "18 Jun". */
  uploadedOn: string;
  sizeLabel: string;
  /**
   * Lowercase extension of the actual uploaded file (from `storage_path`,
   * which keeps the original filename), e.g. "pdf" - `name` is a free-text
   * label and can't be trusted to carry one.
   */
  fileExt: string;
}

/** `name` with its real extension appended, for anything that needs to
 * infer file type (preview, download) rather than just display the label. */
export function fileNameWithExt(file: Pick<NoteFile, "name" | "fileExt">): string {
  if (!file.fileExt) return file.name;
  return file.name.toLowerCase().endsWith(`.${file.fileExt}`) ? file.name : `${file.name}.${file.fileExt}`;
}

/**
 * Lowercase extension from a storage path, or "" if the originally-uploaded
 * file had no dot in its name at all - `path.split(".").pop()` would
 * otherwise return the *entire path* in that case (there's nothing to split
 * on), which then gets treated as a bogus "extension" everywhere it's used.
 */
export function extensionFromStoragePath(storagePath: string): string {
  const ext = storagePath.split(".").pop()?.toLowerCase() ?? "";
  return ext.includes("/") ? "" : ext;
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

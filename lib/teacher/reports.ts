import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/data/class-levels";
import { TERM_LABELS, currentTerm, currentAcademicYear, termSlug } from "@/lib/data/terms";
import type { ReportClass, ReportTerm } from "@/lib/data/teacher-reports";

interface ClassTeacherSubjectRow {
  id: string;
  subject: string;
  class_id: string;
  classes: { level: string } | null;
}

/**
 * Per-level report summary for the signed-in teacher: which subjects they
 * teach there, how many distinct students across their own sections, and
 * for each of the three fixed terms (lib/data/terms.ts) how many of their
 * class-subject assignments have every roster student graded ("saved") vs.
 * not ("pending"). Read entirely through RLS (class_teacher_subjects_select_own,
 * student_class_memberships_select_teacher, subject_results_select_teacher)
 * rather than a service-role client - nothing here needs to see past the
 * teacher's own assignments.
 */
export async function getReportLevelsForTeacher(teacherId: string): Promise<ReportClass[]> {
  const supabase = await createClient();
  const academicYear = currentAcademicYear();
  const current = currentTerm();

  const { data: ctsData } = await supabase
    .from("class_teacher_subjects")
    .select("id, subject, class_id, classes(level)")
    .eq("teacher_id", teacherId);

  const ctsRows = (ctsData ?? []) as unknown as ClassTeacherSubjectRow[];
  if (ctsRows.length === 0) return [];

  const classIds = Array.from(new Set(ctsRows.map((r) => r.class_id)));
  const ctsIds = ctsRows.map((r) => r.id);

  const [{ data: membershipData }, { data: resultsData }] = await Promise.all([
    supabase
      .from("student_class_memberships")
      .select("class_id, student_id")
      .in("class_id", classIds),
    supabase
      .from("subject_results")
      .select("class_teacher_subject_id, student_id, term")
      .in("class_teacher_subject_id", ctsIds)
      .eq("academic_year", academicYear),
  ]);

  const rosterByClass = new Map<string, Set<string>>();
  for (const m of membershipData ?? []) {
    const set = rosterByClass.get(m.class_id) ?? new Set<string>();
    set.add(m.student_id);
    rosterByClass.set(m.class_id, set);
  }

  // gradedByTerm[term].get(ctsId) -> Set of student ids graded this term.
  const gradedByTerm = new Map<string, Map<string, Set<string>>>();
  for (const r of resultsData ?? []) {
    const byClass = gradedByTerm.get(r.term) ?? new Map<string, Set<string>>();
    const set = byClass.get(r.class_teacher_subject_id) ?? new Set<string>();
    set.add(r.student_id);
    byClass.set(r.class_teacher_subject_id, set);
    gradedByTerm.set(r.term, byClass);
  }

  const byLevel = new Map<string, { subjects: Set<string>; cts: ClassTeacherSubjectRow[] }>();
  for (const row of ctsRows) {
    const level = row.classes?.level;
    if (!level) continue;
    const entry = byLevel.get(level) ?? { subjects: new Set<string>(), cts: [] };
    entry.subjects.add(row.subject);
    entry.cts.push(row);
    byLevel.set(level, entry);
  }

  return CLASS_LEVELS.filter((level) => byLevel.has(level)).map((level) => {
    const entry = byLevel.get(level)!;
    const studentIds = new Set<string>();
    for (const row of entry.cts) {
      for (const id of rosterByClass.get(row.class_id) ?? []) studentIds.add(id);
    }

    const terms: ReportTerm[] = TERM_LABELS.map((label) => {
      let saved = 0;
      let pending = 0;
      const gradedForTerm = gradedByTerm.get(label);
      for (const row of entry.cts) {
        const roster = rosterByClass.get(row.class_id) ?? new Set<string>();
        if (roster.size === 0) continue;
        const graded = gradedForTerm?.get(row.id) ?? new Set<string>();
        const fullyGraded = [...roster].every((id) => graded.has(id));
        if (fullyGraded) saved++;
        else pending++;
      }
      return {
        id: termSlug(label),
        label,
        current: label === current,
        savedSubjects: saved,
        pending,
      };
    });

    return {
      level,
      studentCount: studentIds.size,
      terms,
      subjects: Array.from(entry.subjects),
    };
  });
}

export interface RosterEntry {
  studentId: string;
  name: string;
  regNumber: string;
  mark: number | null;
  comment: string;
}

export interface TermEntryClass {
  classTeacherSubjectId: string;
  classId: string;
  /** e.g. "GRADE 5 · A" */
  classLabel: string;
  subject: string;
  roster: RosterEntry[];
}

export interface TermEntryRemark {
  classId: string;
  classLabel: string;
  comment: string;
}

export interface TermEntryData {
  classes: TermEntryClass[];
  remarks: TermEntryRemark[];
}

/**
 * Everything the mark-entry screen (app/teacher/reports/[level]/[term]/page.tsx)
 * needs for one teacher/level/term: each of the teacher's class-subject
 * assignments at this level with its roster pre-filled from any existing
 * subject_results row, plus one shared remark box per distinct class
 * section (migration 0021 - there's no single "class teacher" owner, so any
 * subject teacher of that class can see/edit it).
 */
export async function getTermEntryData(
  teacherId: string,
  level: string,
  term: string,
  academicYear: number
): Promise<TermEntryData> {
  const supabase = await createClient();

  const { data: ctsData } = await supabase
    .from("class_teacher_subjects")
    .select("id, subject, class_id, classes!inner(level, section)")
    .eq("teacher_id", teacherId)
    .eq("classes.level", level);

  const ctsRows = (ctsData ?? []) as unknown as Array<{
    id: string;
    subject: string;
    class_id: string;
    classes: { level: string; section: string } | null;
  }>;

  if (ctsRows.length === 0) return { classes: [], remarks: [] };

  const classIds = Array.from(new Set(ctsRows.map((r) => r.class_id)));
  const ctsIds = ctsRows.map((r) => r.id);

  const [{ data: membershipData }, { data: resultsData }, { data: remarkData }] =
    await Promise.all([
      supabase
        .from("student_class_memberships")
        .select("class_id, students(id, first_name, last_name, reg_number)")
        .in("class_id", classIds),
      supabase
        .from("subject_results")
        .select("class_teacher_subject_id, student_id, mark, teacher_comment")
        .in("class_teacher_subject_id", ctsIds)
        .eq("term", term)
        .eq("academic_year", academicYear),
      supabase
        .from("class_term_remarks")
        .select("class_id, class_teacher_comment")
        .in("class_id", classIds)
        .eq("term", term)
        .eq("academic_year", academicYear),
    ]);

  const rosterByClass = new Map<string, RosterEntry[]>();
  for (const m of (membershipData ?? []) as unknown as Array<{
    class_id: string;
    students: { id: string; first_name: string; last_name: string; reg_number: string } | null;
  }>) {
    if (!m.students) continue;
    const list = rosterByClass.get(m.class_id) ?? [];
    list.push({
      studentId: m.students.id,
      name: `${m.students.last_name}, ${m.students.first_name}`,
      regNumber: m.students.reg_number,
      mark: null,
      comment: "",
    });
    rosterByClass.set(m.class_id, list);
  }
  for (const list of rosterByClass.values()) list.sort((a, b) => a.name.localeCompare(b.name));

  const resultsByCts = new Map<string, Map<string, { mark: number; comment: string }>>();
  for (const r of resultsData ?? []) {
    const byStudent = resultsByCts.get(r.class_teacher_subject_id) ?? new Map();
    byStudent.set(r.student_id, { mark: Number(r.mark), comment: r.teacher_comment });
    resultsByCts.set(r.class_teacher_subject_id, byStudent);
  }

  const remarkByClass = new Map((remarkData ?? []).map((r) => [r.class_id, r.class_teacher_comment]));

  const classes: TermEntryClass[] = ctsRows.map((row) => {
    const existing = resultsByCts.get(row.id);
    const roster = (rosterByClass.get(row.class_id) ?? []).map((entry) => {
      const saved = existing?.get(entry.studentId);
      return saved ? { ...entry, mark: saved.mark, comment: saved.comment } : entry;
    });
    return {
      classTeacherSubjectId: row.id,
      classId: row.class_id,
      classLabel: `${row.classes!.level} · ${row.classes!.section}`,
      subject: row.subject,
      roster,
    };
  });

  const remarks: TermEntryRemark[] = Array.from(new Map(ctsRows.map((r) => [r.class_id, r])).values()).map(
    (row) => ({
      classId: row.class_id,
      classLabel: `${row.classes!.level} · ${row.classes!.section}`,
      comment: remarkByClass.get(row.class_id) ?? "",
    })
  );

  return { classes, remarks };
}

import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/data/class-levels";
import { TERM_LABELS, currentTerm, currentAcademicYear, termSlug } from "@/lib/data/terms";

export interface AdminReportTerm {
  id: string;
  label: string;
  current: boolean;
  saved: number;
  pending: number;
}

export interface AdminReportLevel {
  level: string;
  classCount: number;
  studentCount: number;
  terms: AdminReportTerm[];
}

/**
 * Same shape as lib/teacher/reports.ts's getReportLevelsForTeacher, but
 * across every class/teacher in the school rather than one teacher's own
 * assignments - read through the admin-scoped RLS policies on classes,
 * class_teacher_subjects, student_class_memberships, and subject_results
 * (all gated by current_user_role() = 'admin' and school_id match), so a
 * plain signed-in client is enough; no service-role client needed for a
 * read-only aggregate.
 */
export async function getReportLevelsForAdmin(): Promise<AdminReportLevel[]> {
  const supabase = await createClient();
  const academicYear = currentAcademicYear();
  const current = currentTerm();

  const [{ data: classesData }, { data: ctsData }, { data: membershipData }] = await Promise.all([
    supabase.from("classes").select("id, level"),
    supabase.from("class_teacher_subjects").select("id, class_id"),
    supabase.from("student_class_memberships").select("class_id, student_id"),
  ]);

  const classes = classesData ?? [];
  const cts = ctsData ?? [];
  const memberships = membershipData ?? [];
  const ctsIds = cts.map((c) => c.id);

  const { data: resultsData } = ctsIds.length
    ? await supabase
        .from("subject_results")
        .select("class_teacher_subject_id, student_id, term")
        .in("class_teacher_subject_id", ctsIds)
        .eq("academic_year", academicYear)
    : { data: [] as { class_teacher_subject_id: string; student_id: string; term: string }[] };

  const rosterByClass = new Map<string, Set<string>>();
  for (const m of memberships) {
    const set = rosterByClass.get(m.class_id) ?? new Set<string>();
    set.add(m.student_id);
    rosterByClass.set(m.class_id, set);
  }

  const ctsByClass = new Map<string, string[]>();
  for (const row of cts) {
    const list = ctsByClass.get(row.class_id) ?? [];
    list.push(row.id);
    ctsByClass.set(row.class_id, list);
  }

  // term -> class_teacher_subject_id -> set of graded student ids
  const gradedByTerm = new Map<string, Map<string, Set<string>>>();
  for (const r of resultsData ?? []) {
    const byCts = gradedByTerm.get(r.term) ?? new Map<string, Set<string>>();
    const set = byCts.get(r.class_teacher_subject_id) ?? new Set<string>();
    set.add(r.student_id);
    byCts.set(r.class_teacher_subject_id, set);
    gradedByTerm.set(r.term, byCts);
  }

  const byLevel = new Map<string, { classIds: Set<string>; studentIds: Set<string> }>();
  for (const c of classes) {
    const entry = byLevel.get(c.level) ?? { classIds: new Set<string>(), studentIds: new Set<string>() };
    entry.classIds.add(c.id);
    for (const sid of rosterByClass.get(c.id) ?? []) entry.studentIds.add(sid);
    byLevel.set(c.level, entry);
  }

  return CLASS_LEVELS.filter((level) => byLevel.has(level)).map((level) => {
    const entry = byLevel.get(level)!;

    const terms: AdminReportTerm[] = TERM_LABELS.map((label) => {
      let saved = 0;
      let pending = 0;
      const gradedForTerm = gradedByTerm.get(label);
      for (const classId of entry.classIds) {
        const roster = rosterByClass.get(classId) ?? new Set<string>();
        const ctsForClass = ctsByClass.get(classId) ?? [];
        if (roster.size === 0 || ctsForClass.length === 0) continue;
        const fullyGraded = ctsForClass.every((ctsId) => {
          const graded = gradedForTerm?.get(ctsId) ?? new Set<string>();
          return [...roster].every((sid) => graded.has(sid));
        });
        if (fullyGraded) saved++;
        else pending++;
      }
      return { id: termSlug(label), label, current: label === current, saved, pending };
    });

    return {
      level,
      classCount: entry.classIds.size,
      studentCount: entry.studentIds.size,
      terms,
    };
  });
}

export interface AdminReportSubjectMark {
  subject: string;
  mark: number | null;
  comment: string;
}

export interface AdminReportStudentRow {
  studentId: string;
  name: string;
  regNumber: string;
  subjects: AdminReportSubjectMark[];
  average: number | null;
  position: number | null;
}

export interface AdminClassReport {
  classId: string;
  classLabel: string;
  classTeacherComment: string;
  subjectOrder: string[];
  students: AdminReportStudentRow[];
}

/** 1-based competition rank: ties share a rank, the next distinct value skips ahead. */
function rankOf(descendingValues: number[], value: number): number {
  return 1 + descendingValues.filter((v) => v > value).length;
}

/**
 * Every class (section) at a level, as a read-only mark sheet: each
 * student's subject marks/comments, overall average, and rank within the
 * class - same computation as lib/students/results.ts, just across every
 * student in the class rather than one. No write path here; admin reports
 * only reads what teachers already saved via app/teacher/reports/actions.ts.
 */
export async function getTermReportsForLevel(
  level: string,
  term: string,
  academicYear: number
): Promise<AdminClassReport[]> {
  const supabase = await createClient();

  const { data: classesData } = await supabase
    .from("classes")
    .select("id, level, section")
    .eq("level", level);

  const classes = classesData ?? [];
  if (classes.length === 0) return [];
  const classIds = classes.map((c) => c.id);

  const [{ data: ctsData }, { data: membershipData }, { data: remarkData }] = await Promise.all([
    supabase.from("class_teacher_subjects").select("id, subject, class_id").in("class_id", classIds),
    supabase
      .from("student_class_memberships")
      .select("class_id, students(id, first_name, last_name, reg_number)")
      .in("class_id", classIds),
    supabase
      .from("class_term_remarks")
      .select("class_id, class_teacher_comment")
      .in("class_id", classIds)
      .eq("term", term)
      .eq("academic_year", academicYear),
  ]);

  const cts = ctsData ?? [];
  const ctsIds = cts.map((c) => c.id);

  const { data: resultsData } = ctsIds.length
    ? await supabase
        .from("subject_results")
        .select("class_teacher_subject_id, student_id, mark, teacher_comment")
        .in("class_teacher_subject_id", ctsIds)
        .eq("term", term)
        .eq("academic_year", academicYear)
    : { data: [] as { class_teacher_subject_id: string; student_id: string; mark: number; teacher_comment: string }[] };

  const subjectByCts = new Map(cts.map((c) => [c.id, c.subject]));
  const ctsByClass = new Map<string, string[]>();
  for (const c of cts) {
    const list = ctsByClass.get(c.class_id) ?? [];
    list.push(c.id);
    ctsByClass.set(c.class_id, list);
  }

  const resultsByStudent = new Map<string, Map<string, { mark: number; comment: string }>>();
  for (const r of resultsData ?? []) {
    const m = resultsByStudent.get(r.student_id) ?? new Map<string, { mark: number; comment: string }>();
    m.set(r.class_teacher_subject_id, { mark: Number(r.mark), comment: r.teacher_comment });
    resultsByStudent.set(r.student_id, m);
  }

  const remarkByClass = new Map((remarkData ?? []).map((r) => [r.class_id, r.class_teacher_comment]));

  const rosterByClass = new Map<string, Array<{ id: string; first_name: string; last_name: string; reg_number: string }>>();
  for (const m of (membershipData ?? []) as unknown as Array<{
    class_id: string;
    students: { id: string; first_name: string; last_name: string; reg_number: string } | null;
  }>) {
    if (!m.students) continue;
    const list = rosterByClass.get(m.class_id) ?? [];
    list.push(m.students);
    rosterByClass.set(m.class_id, list);
  }

  return classes.map((cls) => {
    const ctsForClass = ctsByClass.get(cls.id) ?? [];
    const subjectOrder = [...ctsForClass.map((id) => subjectByCts.get(id) ?? "Unknown")].sort((a, b) =>
      a.localeCompare(b)
    );
    const roster = rosterByClass.get(cls.id) ?? [];

    const withAverages = roster.map((s) => {
      const resultsForStudent = resultsByStudent.get(s.id);
      const subjects: AdminReportSubjectMark[] = ctsForClass
        .map((ctsId) => {
          const entry = resultsForStudent?.get(ctsId);
          return {
            subject: subjectByCts.get(ctsId) ?? "Unknown",
            mark: entry?.mark ?? null,
            comment: entry?.comment ?? "",
          };
        })
        .sort((a, b) => a.subject.localeCompare(b.subject));

      const graded = subjects.filter((s) => s.mark !== null).map((s) => s.mark as number);
      const average = graded.length > 0 ? Math.round((graded.reduce((sum, m) => sum + m, 0) / graded.length) * 10) / 10 : null;

      return {
        studentId: s.id,
        name: `${s.last_name}, ${s.first_name}`,
        regNumber: s.reg_number,
        subjects,
        average,
      };
    });

    const sortedAverages = withAverages
      .filter((s) => s.average !== null)
      .map((s) => s.average as number)
      .sort((a, b) => b - a);

    const students: AdminReportStudentRow[] = withAverages
      .map((s) => ({ ...s, position: s.average !== null ? rankOf(sortedAverages, s.average) : null }))
      .sort((a, b) => {
        if (a.position === null) return 1;
        if (b.position === null) return -1;
        return a.position - b.position;
      });

    return {
      classId: cls.id,
      classLabel: `${cls.level} · ${cls.section}`,
      classTeacherComment: remarkByClass.get(cls.id) ?? "",
      subjectOrder,
      students,
    };
  });
}

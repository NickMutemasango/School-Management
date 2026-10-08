import { createClient } from "@/lib/supabase/server";
import { currentAcademicYear, currentTerm } from "@/lib/data/terms";
import { termSlug } from "@/lib/data/terms";
import type { SubjectResult, TermResult } from "@/lib/data/student-results";

/** 1-based competition rank: ties share a rank, the next distinct value skips ahead. */
function rankOf(descendingValues: number[], value: number): number {
  return 1 + descendingValues.filter((v) => v > value).length;
}

/**
 * The signed-in student's published results, grouped by term/year, newest
 * first. average/position/classSize/classPosition are computed here rather
 * than stored - they're a function of every classmate's marks for the same
 * term, which can change whenever any subject teacher saves (migration
 * 0021's header comment). Reads subject_results via
 * subject_results_select_classmate (needs every classmate's mark to rank
 * against) and class_term_remarks via class_term_remarks_select_student.
 */
export async function getResultsForStudent(studentId: string): Promise<TermResult[]> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("student_class_memberships")
    .select("class_id")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!membership) return [];

  const { data: ctsData } = await supabase
    .from("class_teacher_subjects")
    .select("id, subject")
    .eq("class_id", membership.class_id);

  const ctsRows = ctsData ?? [];
  if (ctsRows.length === 0) return [];
  const ctsIds = ctsRows.map((r) => r.id);
  const subjectByCts = new Map(ctsRows.map((r) => [r.id, r.subject]));

  const [{ data: resultsData }, { data: remarkData }] = await Promise.all([
    supabase
      .from("subject_results")
      .select("id, class_teacher_subject_id, student_id, term, academic_year, mark, teacher_comment")
      .in("class_teacher_subject_id", ctsIds),
    supabase
      .from("class_term_remarks")
      .select("term, academic_year, class_teacher_comment")
      .eq("class_id", membership.class_id),
  ]);

  const remarkByTermYear = new Map(
    (remarkData ?? []).map((r) => [`${r.term}::${r.academic_year}`, r.class_teacher_comment])
  );

  // Group every row by (term, year), the unit a TermResult represents.
  const byTermYear = new Map<string, typeof resultsData>();
  for (const row of resultsData ?? []) {
    const key = `${row.term}::${row.academic_year}`;
    const list = byTermYear.get(key) ?? [];
    list.push(row);
    byTermYear.set(key, list);
  }

  const now = { term: currentTerm(), year: currentAcademicYear() };

  const results: TermResult[] = [];
  for (const [key, rows] of byTermYear.entries()) {
    const [term, yearStr] = key.split("::");
    const year = Number(yearStr);

    const mine = rows!.filter((r) => r.student_id === studentId);
    if (mine.length === 0) continue;

    // Per-subject class position/size: every student's mark for that exact
    // class_teacher_subject_id this term/year.
    const subjects: SubjectResult[] = mine.map((r) => {
      const classMarks = rows!
        .filter((o) => o.class_teacher_subject_id === r.class_teacher_subject_id)
        .map((o) => Number(o.mark))
        .sort((a, b) => b - a);
      return {
        id: r.id,
        subject: subjectByCts.get(r.class_teacher_subject_id) ?? "Unknown",
        mark: Number(r.mark),
        classPosition: rankOf(classMarks, Number(r.mark)),
        classSize: classMarks.length,
        teacherComment: r.teacher_comment,
      };
    });

    // Overall position: average of each classmate's own marks this
    // term/year, ranked among everyone who has at least one recorded mark.
    const marksByStudent = new Map<string, number[]>();
    for (const row of rows!) {
      const list = marksByStudent.get(row.student_id) ?? [];
      list.push(Number(row.mark));
      marksByStudent.set(row.student_id, list);
    }
    const averages: number[] = [];
    for (const [, marks] of marksByStudent) {
      averages.push(marks.reduce((s, m) => s + m, 0) / marks.length);
    }
    const myAverage =
      mine.reduce((s, r) => s + Number(r.mark), 0) / mine.length;
    const sortedAverages = [...averages].sort((a, b) => b - a);

    results.push({
      id: `${termSlug(term)}-${year}`,
      label: `${term}, ${year}`,
      current: term === now.term && year === now.year,
      average: Math.round(myAverage * 10) / 10,
      position: rankOf(sortedAverages, myAverage),
      classSize: sortedAverages.length,
      classTeacherComment: remarkByTermYear.get(key) ?? "",
      headComment: "",
      subjects: subjects.sort((a, b) => a.subject.localeCompare(b.subject)),
    });
  }

  return results.sort((a, b) => (a.label < b.label ? 1 : -1));
}

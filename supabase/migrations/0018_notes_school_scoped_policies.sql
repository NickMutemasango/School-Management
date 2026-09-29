-- Fixes a real gap migration 0016 missed: notes_select_teacher/
-- notes_select_student (migration 0007) match a teacher/student to a notes
-- row purely via the free-text classes.level / students.class_level column,
-- with no school scoping at all. 0016's own header comment claimed every
-- "join-based" policy was already tenant-safe because it resolves through
-- an exact class_teacher_subjects/student_class_memberships row - true for
-- every other join-based policy, but false here, since this join keys on a
-- text label, not a row that's inherently confined to one school.
--
-- Once a second school exists and both schools activate an overlapping
-- curriculum level (expected, since 0017 seeds one shared global
-- level_definitions catalogue every school draws from - e.g. both schools
-- have a class labeled "GRADE 5"), a teacher or student at School B could
-- read School A's private class-notes files. class_teacher_subjects,
-- classes, students and notes all carry school_id since migration 0015, so
-- the fix is adding that equality check alongside the existing level match.

drop policy if exists "notes_select_teacher" on public.notes;
create policy "notes_select_teacher"
  on public.notes for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      join public.classes c on c.id = cts.class_id
      where cts.teacher_id = auth.uid()
        and c.level = notes.level
        and cts.school_id = notes.school_id
    )
  );

drop policy if exists "notes_select_student" on public.notes;
create policy "notes_select_student"
  on public.notes for select
  using (
    exists (
      select 1 from public.students s
      where s.id = auth.uid()
        and s.class_level = notes.level
        and s.school_id = notes.school_id
    )
  );

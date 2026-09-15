-- Missed when student_class_memberships (0008) added student visibility
-- everywhere else: `classes` itself only had admin/teacher select policies,
-- so a student reading their own membership row's embedded `classes(level,
-- section)` (getMyClass, lib/students/classmates.ts) got RLS-blocked back
-- to null and the function returned "not in a class" even when the
-- membership and teacher assignment both existed. Mirrors
-- classes_select_teacher's shape - no recursion risk, student_class_memberships'
-- own policies don't reference `classes`.
create policy "classes_select_student"
  on public.classes for select
  using (
    exists (
      select 1 from public.student_class_memberships scm
      where scm.class_id = classes.id and scm.student_id = auth.uid()
    )
  );

-- Every "*_select_admin"/"*_update_admin" policy so far reads only
-- `current_user_role() = 'admin'` - true for any active admin at any school.
-- That's harmless while there is exactly one school (migration 0015 seeded
-- it), but it's a real cross-tenant leak the moment a second school exists:
-- School A's admin would see every row at School B too. Tighten each one to
-- also require school_id = current_user_school_id() (migration 0015).
--
-- Not touched here: the join-based teacher/student policies (e.g.
-- classes_select_teacher, student_class_memberships_select_own,
-- assignments_select_student). Those already resolve through an exact
-- class_teacher_subjects/student_class_memberships row, which can only ever
-- belong to one school - there's no equivalent "any row, any school" gap to
-- close there.

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "students_select_admin" on public.students;
create policy "students_select_admin"
  on public.students for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "students_update_admin" on public.students;
create policy "students_update_admin"
  on public.students for update
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "classes_select_admin" on public.classes;
create policy "classes_select_admin"
  on public.classes for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "class_teacher_subjects_select_admin" on public.class_teacher_subjects;
create policy "class_teacher_subjects_select_admin"
  on public.class_teacher_subjects for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "timetable_entries_select_admin" on public.timetable_entries;
create policy "timetable_entries_select_admin"
  on public.timetable_entries for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "notes_select_admin" on public.notes;
create policy "notes_select_admin"
  on public.notes for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "student_class_memberships_select_admin" on public.student_class_memberships;
create policy "student_class_memberships_select_admin"
  on public.student_class_memberships for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "assignments_select_admin" on public.assignments;
create policy "assignments_select_admin"
  on public.assignments for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

drop policy if exists "assignment_submissions_select_admin" on public.assignment_submissions;
create policy "assignment_submissions_select_admin"
  on public.assignment_submissions for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

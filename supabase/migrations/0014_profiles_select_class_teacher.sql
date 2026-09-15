-- Another gap from the same family as 0013: `profiles` only has
-- profiles_select_own and profiles_select_admin (migration 0001) - nothing
-- lets a student read a *teacher's* profile row, so every
-- `class_teacher_subjects(subject, profiles(full_name, email))` embed a
-- student reads (getMyClass, getAssignmentsForStudent) gets the profile
-- silently RLS-blocked to null and falls back to "Unknown". Mirrors
-- classes_select_student's shape - reuses is_member_of_class (0009), no
-- recursion risk since that helper is SECURITY DEFINER.
create policy "profiles_select_class_teacher"
  on public.profiles for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.teacher_id = profiles.id
        and public.is_member_of_class(cts.class_id)
    )
  );

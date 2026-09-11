-- current_user_role() only checked `role`, never `status`, so every
-- "= 'admin'" RLS policy built on it (profiles_update_admin,
-- students_select_admin, classes_select_admin,
-- class_teacher_subjects_select_admin, timetable_entries_select_admin,
-- notes_select_admin, student_class_memberships_select_admin) kept
-- granting full admin-level access to a suspended admin's still-valid
-- session - including profiles_update_admin, which let a suspended admin
-- update their own row back to status='active'. Only "active" admins
-- should ever satisfy these policies.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles
  where id = auth.uid() and status = 'active'
$$;

-- student_class_memberships never got a classmate-visibility policy (only
-- select_admin, select_teacher, and select_own exist) - a student could
-- only ever see their own membership row, so the classmates list on
-- /student/class was always empty. Mirrors students_select_classmate,
-- using the same SECURITY DEFINER helper from migration 0009 to avoid
-- reintroducing the recursion that migration fixed.
create policy "student_class_memberships_select_classmate"
  on public.student_class_memberships for select
  using (public.is_member_of_class(class_id));

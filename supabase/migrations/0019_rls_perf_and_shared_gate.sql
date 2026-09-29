-- Code-review follow-up on migrations 0015-0018 (three related fixes):
--
-- 1. current_user_school_id() (0015) independently re-implemented the exact
--    "active profile row" gate (`where id = auth.uid() and status = 'active'`)
--    that current_user_role() already implements. This codebase already
--    shipped migration 0010 specifically because current_user_role() was
--    missing that status check once - having two independent copies risks
--    fixing one and forgetting the other. Both now compose through one
--    current_active_profile_id() helper.
--
-- 2. Every RLS policy added since 0015 calls current_user_role()/
--    current_user_school_id() as bare function calls in USING. STABLE alone
--    doesn't guarantee Postgres hoists a zero-argument function call into a
--    single per-statement InitPlan - the documented Postgres/Supabase RLS
--    performance pattern is to wrap it `(select fn())` so the planner
--    evaluates it once per statement instead of, in the worst case, once per
--    row scanned. Every affected policy (11 from 0016, plus
--    schools/organisations/school_level_offerings_select_member) is
--    redefined here with that wrapping.
--
-- 3. school_level_offerings_school_id_idx (0017) was redundant: the
--    composite `unique (school_id, level_definition_id, academic_year)`
--    constraint already provides an index usable for school_id-only lookups
--    via the leftmost-column rule, so the extra single-column index only
--    added write amplification with no read benefit.

create or replace function public.current_active_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles where id = auth.uid() and status = 'active'
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = public.current_active_profile_id()
$$;

create or replace function public.current_user_school_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select school_id from public.profiles where id = public.current_active_profile_id()
$$;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "students_select_admin" on public.students;
create policy "students_select_admin"
  on public.students for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "students_update_admin" on public.students;
create policy "students_update_admin"
  on public.students for update
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "classes_select_admin" on public.classes;
create policy "classes_select_admin"
  on public.classes for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "class_teacher_subjects_select_admin" on public.class_teacher_subjects;
create policy "class_teacher_subjects_select_admin"
  on public.class_teacher_subjects for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "timetable_entries_select_admin" on public.timetable_entries;
create policy "timetable_entries_select_admin"
  on public.timetable_entries for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "notes_select_admin" on public.notes;
create policy "notes_select_admin"
  on public.notes for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "student_class_memberships_select_admin" on public.student_class_memberships;
create policy "student_class_memberships_select_admin"
  on public.student_class_memberships for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "assignments_select_admin" on public.assignments;
create policy "assignments_select_admin"
  on public.assignments for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "assignment_submissions_select_admin" on public.assignment_submissions;
create policy "assignment_submissions_select_admin"
  on public.assignment_submissions for select
  using ((select public.current_user_role()) = 'admin' and school_id = (select public.current_user_school_id()));

drop policy if exists "schools_select_member" on public.schools;
create policy "schools_select_member"
  on public.schools for select
  using (id = (select public.current_user_school_id()));

drop policy if exists "organisations_select_member" on public.organisations;
create policy "organisations_select_member"
  on public.organisations for select
  using (
    id = (select s.organisation_id from public.schools s where s.id = (select public.current_user_school_id()))
  );

drop policy if exists "school_level_offerings_select_member" on public.school_level_offerings;
create policy "school_level_offerings_select_member"
  on public.school_level_offerings for select
  using (school_id = (select public.current_user_school_id()));

drop index if exists public.school_level_offerings_school_id_idx;

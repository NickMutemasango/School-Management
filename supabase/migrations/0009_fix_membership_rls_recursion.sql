-- Fixes infinite recursion: student_class_memberships_select_teacher reads
-- class_teacher_subjects, and class_teacher_subjects_select_own_class reads
-- student_class_memberships right back - each triggers the other's RLS,
-- looping until Postgres errors ("infinite recursion detected in policy").
--
-- Same fix as current_user_role() uses for profiles: a SECURITY DEFINER
-- function bypasses RLS internally, so the check itself doesn't re-trigger
-- policy evaluation on the other table.
create or replace function public.is_teacher_of_class(target_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.class_teacher_subjects
    where class_id = target_class_id and teacher_id = auth.uid()
  )
$$;

create or replace function public.is_member_of_class(target_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.student_class_memberships
    where class_id = target_class_id and student_id = auth.uid()
  )
$$;

drop policy if exists "student_class_memberships_select_teacher" on public.student_class_memberships;
create policy "student_class_memberships_select_teacher"
  on public.student_class_memberships for select
  using (public.is_teacher_of_class(class_id));

drop policy if exists "class_teacher_subjects_select_own_class" on public.class_teacher_subjects;
create policy "class_teacher_subjects_select_own_class"
  on public.class_teacher_subjects for select
  using (public.is_member_of_class(class_id));

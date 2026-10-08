-- Parent portal: a fourth role, read-only. A parent is linked to one or
-- more students via parent_students (many-to-many: multiple guardians per
-- student, multiple children per guardian) and can see each linked child's
-- results, fees/invoices, and notes - nothing else, and no write actions
-- anywhere (app/admin/students/actions.ts's inviteGuardian is the only
-- write path, and it only touches profiles/parent_students).
--
-- Mirrors the existing is_teacher_of_class()/is_member_of_class() pattern
-- (migration 0009): two SECURITY DEFINER helpers so every downstream policy
-- stays a one-line `using (public.is_parent_of_student(...))` instead of
-- repeating the parent_students join six times.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'teacher', 'student', 'parent'));

create table public.parent_students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  parent_profile_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_profile_id, student_id)
);

alter table public.parent_students enable row level security;

create policy "parent_students_select_admin"
  on public.parent_students for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

create policy "parent_students_select_own"
  on public.parent_students for select
  using (parent_profile_id = auth.uid());

-- No insert/update/delete policies: linked only via a service-role action
-- (app/admin/students/actions.ts's inviteGuardian), gated by requireActiveAdmin().

create index parent_students_parent_profile_id_idx on public.parent_students (parent_profile_id);
create index parent_students_student_id_idx on public.parent_students (student_id);

create or replace function public.is_parent_of_student(target_student_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.parent_students
    where student_id = target_student_id and parent_profile_id = auth.uid()
  )
$$;

create or replace function public.is_parent_of_class(target_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.parent_students ps
    join public.student_class_memberships scm on scm.student_id = ps.student_id
    where scm.class_id = target_class_id and ps.parent_profile_id = auth.uid()
  )
$$;

create policy "students_select_parent"
  on public.students for select
  using (public.is_parent_of_student(id));

create policy "student_class_memberships_select_parent"
  on public.student_class_memberships for select
  using (public.is_parent_of_student(student_id));

create policy "class_teacher_subjects_select_parent"
  on public.class_teacher_subjects for select
  using (public.is_parent_of_class(class_id));

create policy "subject_results_select_parent"
  on public.subject_results for select
  using (public.is_parent_of_student(student_id));

create policy "class_term_remarks_select_parent"
  on public.class_term_remarks for select
  using (public.is_parent_of_class(class_id));

-- notes are keyed by level (a free-text label, not class_id) - same join
-- shape as notes_select_student (migration 0018), through parent_students
-- instead of auth.uid() directly.
create policy "notes_select_parent"
  on public.notes for select
  using (
    exists (
      select 1 from public.students s
      join public.parent_students ps on ps.student_id = s.id
      where ps.parent_profile_id = auth.uid()
        and s.class_level = notes.level
        and s.school_id = notes.school_id
    )
  );

create policy "invoices_select_parent"
  on public.invoices for select
  using (public.is_parent_of_student(student_id));

create policy "invoice_line_items_select_parent"
  on public.invoice_line_items for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id and public.is_parent_of_student(i.student_id)
    )
  );

create policy "payments_select_parent"
  on public.payments for select
  using (public.is_parent_of_student(student_id));

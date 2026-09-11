-- Introduces the first real "classes" concept: a class is a level + section
-- (e.g. "Grade 5A", "Grade 5B" - schools run multiple streams per level).
-- `class_teacher_subjects` records which teacher teaches which subject in
-- which class; admins manage both via the admin portal, so - same
-- convention as `students` - no insert/update/delete policies exist here,
-- only service-role admin actions can mutate these tables.
--
-- Deliberately out of scope for this migration: linking enrolled students to
-- `classes` (students.class_level stays a free-text column for now) and full
-- day/period/room timetabling (that stays teacher-portal mock data). Both
-- are natural follow-ups once this foundation lands.
--
-- Tables are created before any policies (including `classes`'s own) since
-- `classes_select_teacher`'s USING clause references `class_teacher_subjects`
-- - Postgres validates policy bodies at creation time, so that table must
-- already exist.

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  section text not null,
  created_at timestamptz not null default now(),
  unique (level, section)
);

create table public.class_teacher_subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  created_at timestamptz not null default now(),
  unique (class_id, teacher_id, subject)
);

alter table public.classes enable row level security;
alter table public.class_teacher_subjects enable row level security;

create policy "classes_select_admin"
  on public.classes for select
  using (public.current_user_role() = 'admin');

-- Teachers can see any class they're assigned to (needed so the dashboard
-- stats query can resolve level/section without a service-role client).
-- Uses an EXISTS subquery against class_teacher_subjects rather than a join,
-- since RLS policies operate row-by-row on `classes`.
create policy "classes_select_teacher"
  on public.classes for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.class_id = classes.id
        and cts.teacher_id = auth.uid()
    )
  );

-- No insert/update/delete policies: classes are created/renamed/deleted only
-- via service-role admin actions (same convention as `students`/`profiles`).

create policy "class_teacher_subjects_select_admin"
  on public.class_teacher_subjects for select
  using (public.current_user_role() = 'admin');

create policy "class_teacher_subjects_select_own"
  on public.class_teacher_subjects for select
  using (teacher_id = auth.uid());

-- No insert/update/delete policies: assignments are created/removed only by
-- the admin server actions (service-role client).

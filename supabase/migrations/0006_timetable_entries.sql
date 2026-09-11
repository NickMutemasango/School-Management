-- Weekly lesson scheduling: which class_teacher_subject happens on which
-- day/period, and in which room. `class_teacher_subjects` (0005) is already
-- the class+subject+teacher entity, so each row here just adds day/period/
-- room to one of those assignments - no separate classId+subject columns
-- (that was the old mock model's conflation).
--
-- `day`/`period_id` are `text check (... in (...))` rather than their own
-- lookup tables, matching `profiles.role`/`profiles.status` - the bell
-- schedule (periods, breaks) is app configuration in
-- lib/data/teacher-schedule.ts, not DB rows, so period_id values must stay
-- in lockstep with that file's non-break period ids (p1-p7).
--
-- teacher_id and class_id are denormalized copies of
-- class_teacher_subjects.teacher_id/class_id. Safe to denormalize because
-- class_teacher_subjects rows are immutable after insert (no update action
-- exists, only insert/delete) - so there's no write path that could desync
-- the copy. Denormalizing buys simple RLS (`teacher_id = auth.uid()`
-- directly, no join in the policy body) and two clean unique constraints
-- below without a join in the constraint itself.
create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  class_teacher_subject_id uuid not null references public.class_teacher_subjects (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  day text not null check (day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  period_id text not null check (period_id in ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7')),
  room text not null default '',
  created_at timestamptz not null default now(),
  -- A teacher can't be in two places in the same period.
  constraint timetable_entries_teacher_slot_unique unique (teacher_id, day, period_id),
  -- A class can't have two lessons in the same period either.
  constraint timetable_entries_class_slot_unique unique (class_id, day, period_id)
);

alter table public.timetable_entries enable row level security;

create policy "timetable_entries_select_admin"
  on public.timetable_entries for select
  using (public.current_user_role() = 'admin');

create policy "timetable_entries_select_teacher"
  on public.timetable_entries for select
  using (teacher_id = auth.uid());

-- No insert/update/delete policies: entries are created/removed only via
-- service-role admin actions (same convention as classes/class_teacher_subjects).

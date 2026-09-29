-- Tenancy foundation (ontology doc, Phase 1 step 1): every domain row now
-- has a real school_id to hang off instead of an implicit single tenant.
-- This app is still single-school in practice, so this migration seeds
-- exactly one organisation/school and gives every existing table a
-- `school_id` column that defaults to that seed row - nothing changes
-- behaviourally today, no app code needs to change, and no existing insert
-- call site (enroll, timetable, notes, ...) needs to start passing
-- school_id explicitly.
--
-- The DEFAULT is training wheels for single-tenant operation, not a
-- permanent feature: once a real onboarding flow creates a second school,
-- every insert path needs to start passing its own school_id and the
-- default should be dropped (`alter table ... alter column school_id drop
-- default`) so a bug can never silently write a row into the wrong tenant.
--
-- Deliberately out of scope here: school_profiles (ownership/governance/
-- residence attributes), capability flags, and tightening the existing
-- `current_user_role() = 'admin'` policies to also check school_id - those
-- unconditional admin policies are a real cross-tenant leak once a second
-- school exists, but this migration only introduces the column; migration
-- 0016 closes that gap.

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz not null default now(),
  unique (organisation_id, code)
);

alter table public.organisations enable row level security;
alter table public.schools enable row level security;

-- Seed the single tenant every existing row belongs to. Rename freely later
-- through an admin "school settings" screen once one exists - this row only
-- exists so `school_id` has something real to default onto.
insert into public.organisations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Default Organisation');

insert into public.schools (id, organisation_id, name, code)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Default School',
  'default'
);

-- profiles needs school_id before current_user_school_id() (below) can read
-- it. Postgres backfills a NOT NULL + constant-DEFAULT column without a
-- table rewrite, so add/backfill/lock-down happen in one statement per
-- table, same as every other column already on this table.
alter table public.profiles
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);

create index profiles_school_id_idx on public.profiles (school_id);

-- SECURITY DEFINER so RLS policies can resolve "which school is this user
-- in" without recursing into profiles' own RLS - same pattern as
-- current_user_role() (migration 0001).
create or replace function public.current_user_school_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select school_id from public.profiles where id = auth.uid() and status = 'active'
$$;

-- Every authenticated user can read the school/org they belong to (needed
-- so the UI can show the school name/terminology without a service-role
-- call). No insert/update/delete policies: organisations/schools are
-- created and edited only via service-role onboarding actions, same
-- convention as every other table in this project.
create policy "schools_select_member"
  on public.schools for select
  using (id = public.current_user_school_id());

create policy "organisations_select_member"
  on public.organisations for select
  using (
    id = (select s.organisation_id from public.schools s where s.id = public.current_user_school_id())
  );

alter table public.students
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index students_school_id_idx on public.students (school_id);

alter table public.classes
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index classes_school_id_idx on public.classes (school_id);

alter table public.class_teacher_subjects
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index class_teacher_subjects_school_id_idx on public.class_teacher_subjects (school_id);

alter table public.timetable_entries
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index timetable_entries_school_id_idx on public.timetable_entries (school_id);

alter table public.notes
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index notes_school_id_idx on public.notes (school_id);

alter table public.assignments
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index assignments_school_id_idx on public.assignments (school_id);

alter table public.assignment_submissions
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index assignment_submissions_school_id_idx on public.assignment_submissions (school_id);

alter table public.student_class_memberships
  add column school_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.schools (id);
create index student_class_memberships_school_id_idx on public.student_class_memberships (school_id);

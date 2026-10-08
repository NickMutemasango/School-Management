-- Admin settings: school profile, grading bands, and notification
-- preferences. app/admin/settings has been a bare placeholder until now.
--
-- school_settings is a 1:1 extension of schools (school_id as its own
-- primary key, not a separate uuid) - every school gets exactly one row,
-- seeded here for the existing single tenant (same seeding convention as
-- migration 0015's organisations/schools rows). Read-access is admin-only:
-- unlike schools/organisations (readable by every member, migration 0015),
-- nothing here is shown outside the admin portal yet.
--
-- grade_bands replaces the hardcoded GRADE_BANDS array in
-- lib/data/student-results.ts - readable by every school member (students
-- need it to render their own results' grades), writable only via a
-- service-role action. Seeded with the same A/B/C/D/E/U thresholds that
-- were previously hardcoded, so existing results render identically until
-- an admin changes them.

create table public.school_settings (
  school_id uuid primary key references public.schools (id) on delete cascade,
  address text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  academic_year_start_month smallint not null default 1 check (academic_year_start_month between 1 and 12),
  notify_admins_on_staff_signup boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.school_settings enable row level security;

create policy "school_settings_select_admin"
  on public.school_settings for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

-- No insert/update/delete policies: edited only via a service-role action
-- (app/admin/settings/actions.ts), gated by requireActiveAdmin().

insert into public.school_settings (school_id)
values ('00000000-0000-0000-0000-000000000001');

create table public.grade_bands (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  grade text not null check (grade in ('A', 'B', 'C', 'D', 'E', 'U')),
  min_mark numeric(5, 2) not null check (min_mark >= 0 and min_mark <= 100),
  sort_order smallint not null,
  unique (school_id, grade)
);

alter table public.grade_bands enable row level security;

create policy "grade_bands_select_member"
  on public.grade_bands for select
  using (school_id = public.current_user_school_id());

-- No insert/update/delete policies: edited only via a service-role action.

insert into public.grade_bands (school_id, grade, min_mark, sort_order)
values
  ('00000000-0000-0000-0000-000000000001', 'A', 75, 1),
  ('00000000-0000-0000-0000-000000000001', 'B', 65, 2),
  ('00000000-0000-0000-0000-000000000001', 'C', 50, 3),
  ('00000000-0000-0000-0000-000000000001', 'D', 40, 4),
  ('00000000-0000-0000-0000-000000000001', 'E', 30, 5),
  ('00000000-0000-0000-0000-000000000001', 'U', 0, 6);

create index grade_bands_school_id_idx on public.grade_bands (school_id);

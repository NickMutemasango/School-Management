-- Level configuration (ontology doc, Phase 1 steps 2-3): replaces "does
-- Grade 7 or Form 4 exist" as a question application code answers
-- (CLASS_LEVELS in lib/data/class-levels.ts) with a configurable, versioned
-- hierarchy a school activates per academic year. classes.level stays
-- exactly as it is - free text, still the display source for existing UI -
-- this migration adds the configuration layer alongside it and links each
-- class to it, rather than replacing it outright (retain legacy fields as
-- projections, per the ontology doc).
--
-- education_frameworks/programmes/level_definitions are reusable template
-- data seeded below from Zimbabwe's Heritage-Based Curriculum bands, with
-- codes/labels matching lib/data/class-levels.ts exactly (CLASS_LEVELS
-- entries and its levelSlug() helper) so the backfill below is an exact
-- match, not a fuzzy one.
--
-- Deliberately out of scope here: letting a school author its own custom
-- programme/level_definition rows (school_level_offerings only points at
-- framework-owned levels for now - this single-tenant app only needs the
-- one seeded template), and progression_rule (grade-to-grade promotion
-- links). Both are natural follow-ups once there's a real onboarding flow
-- that needs them.

create table public.education_frameworks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  version text not null,
  created_at timestamptz not null default now()
);

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.education_frameworks (id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (framework_id, code)
);

create table public.level_definitions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes (id) on delete cascade,
  code text not null,
  display_label text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (programme_id, code),
  unique (programme_id, sort_order)
);

alter table public.education_frameworks enable row level security;
alter table public.programmes enable row level security;
alter table public.level_definitions enable row level security;

-- Reference/template data, not tenant-owned: every authenticated user can
-- read it (a school "activates" a level via school_level_offerings below,
-- it doesn't own the definition itself). No insert/update/delete policies:
-- seeded by migration, managed by a future platform-admin tool, never by a
-- school-level admin action.
create policy "education_frameworks_select_authenticated"
  on public.education_frameworks for select
  using (auth.role() = 'authenticated');

create policy "programmes_select_authenticated"
  on public.programmes for select
  using (auth.role() = 'authenticated');

create policy "level_definitions_select_authenticated"
  on public.level_definitions for select
  using (auth.role() = 'authenticated');

create table public.school_level_offerings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  level_definition_id uuid not null references public.level_definitions (id) on delete restrict,
  academic_year integer not null,
  status text not null default 'active' check (status in ('planned', 'active', 'closed')),
  created_at timestamptz not null default now(),
  unique (school_id, level_definition_id, academic_year)
);

alter table public.school_level_offerings enable row level security;

create policy "school_level_offerings_select_member"
  on public.school_level_offerings for select
  using (school_id = public.current_user_school_id());

-- No insert/update/delete policies: offerings are enabled/closed only via a
-- service-role school-configuration action (same convention as
-- classes/class_teacher_subjects).

create index programmes_framework_id_idx on public.programmes (framework_id);
create index level_definitions_programme_id_idx on public.level_definitions (programme_id);
create index school_level_offerings_school_id_idx on public.school_level_offerings (school_id);

-- Seed: Zimbabwe Heritage-Based Curriculum, version 2024-2030 (ontology doc
-- [2]), covering every band CLASS_LEVELS already exposes across the app.
insert into public.education_frameworks (id, code, name, version)
values (
  '00000000-0000-0000-0000-000000000010',
  'zw-heritage',
  'Zimbabwe Heritage-Based Curriculum',
  '2024-2030'
);

insert into public.programmes (id, framework_id, code, name)
values (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000010',
  'zw-primary-secondary',
  'Primary and Secondary'
);

-- code/display_label match lib/data/class-levels.ts CLASS_LEVELS and
-- levelSlug() exactly ("GRADE 5" -> "grade-5"), band boundaries match the
-- ontology doc's four operational bands (Infant/Junior/Lower/Upper secondary).
insert into public.level_definitions (programme_id, code, display_label, sort_order)
values
  ('00000000-0000-0000-0000-000000000011', 'ecd-a', 'ECD A', 1),
  ('00000000-0000-0000-0000-000000000011', 'ecd-b', 'ECD B', 2),
  ('00000000-0000-0000-0000-000000000011', 'grade-1', 'GRADE 1', 3),
  ('00000000-0000-0000-0000-000000000011', 'grade-2', 'GRADE 2', 4),
  ('00000000-0000-0000-0000-000000000011', 'grade-3', 'GRADE 3', 5),
  ('00000000-0000-0000-0000-000000000011', 'grade-4', 'GRADE 4', 6),
  ('00000000-0000-0000-0000-000000000011', 'grade-5', 'GRADE 5', 7),
  ('00000000-0000-0000-0000-000000000011', 'grade-6', 'GRADE 6', 8),
  ('00000000-0000-0000-0000-000000000011', 'grade-7', 'GRADE 7', 9),
  ('00000000-0000-0000-0000-000000000011', 'form-1', 'FORM 1', 10),
  ('00000000-0000-0000-0000-000000000011', 'form-2', 'FORM 2', 11),
  ('00000000-0000-0000-0000-000000000011', 'form-3', 'FORM 3', 12),
  ('00000000-0000-0000-0000-000000000011', 'form-4', 'FORM 4', 13),
  ('00000000-0000-0000-0000-000000000011', 'form-5', 'FORM 5', 14),
  ('00000000-0000-0000-0000-000000000011', 'form-6', 'FORM 6', 15);

-- Activate every level the default school (migration 0015) actually uses
-- today, derived from the distinct classes.level values already in the
-- table, for the current calendar year. Anything not already in use stays
-- dormant (no offering row) until a school admin turns it on.
insert into public.school_level_offerings (school_id, level_definition_id, academic_year)
select distinct
  c.school_id,
  ld.id,
  extract(year from now())::integer
from public.classes c
join public.level_definitions ld on ld.display_label = c.level
on conflict do nothing;

-- Point every existing class at its offering. classes.level stays untouched
-- (legacy display projection).
alter table public.classes
  add column school_level_offering_id uuid references public.school_level_offerings (id);

update public.classes c
set school_level_offering_id = slo.id
from public.school_level_offerings slo
join public.level_definitions ld on ld.id = slo.level_definition_id
where slo.school_id = c.school_id
  and ld.display_label = c.level;

create index classes_school_level_offering_id_idx on public.classes (school_level_offering_id);

-- The backfill above only reaches rows that existed at migration time.
-- createClass() (app/admin/classes/actions.ts) only inserts (level,
-- section) - it doesn't know about offerings and shouldn't have to - so
-- without this trigger every class created from today onward would sit at
-- school_level_offering_id = null forever. Resolve it server-side instead:
-- same "app code doesn't need to change" approach as the school_id default.
create or replace function public.sync_class_level_offering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select slo.id into new.school_level_offering_id
  from public.school_level_offerings slo
  join public.level_definitions ld on ld.id = slo.level_definition_id
  where slo.school_id = new.school_id
    and ld.display_label = new.level
    and slo.academic_year = extract(year from now())::integer
  limit 1;
  return new;
end;
$$;

create trigger classes_sync_level_offering
  before insert or update of level, school_id on public.classes
  for each row execute function public.sync_class_level_offering();

-- Deliberately NOT set to `not null`: a class whose `level` text doesn't
-- match any seeded display_label, or whose level exists but isn't activated
-- for the current academic year (no school_level_offerings row yet), has no
-- offering to point at - that's a real "this level isn't configured yet"
-- state, not a bug, so the column has to allow null to represent it.

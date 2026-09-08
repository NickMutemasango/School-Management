-- One row per enrolled student, 1:1 with their `profiles` row (created by
-- the enrollment flow via the admin API, same as the `handle_new_user`
-- pattern for staff). `fee_balance` / `attendance_rate` are plain columns for
-- now rather than derived from an `invoices`/`attendance` table, since those
-- don't exist yet - they'll likely become computed once finance/attendance
-- land.
create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  reg_number text not null unique,
  first_name text not null,
  last_name text not null,
  class_level text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'deregistered')),
  gender text check (gender in ('Male', 'Female')),
  date_of_birth date,
  enrolled_on date not null default current_date,
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  guardian_name text not null default '',
  guardian_phone text not null default '',
  guardian_email text not null default '',
  fee_balance numeric(10, 2) not null default 0,
  attendance_rate numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

create policy "students_select_admin"
  on public.students for select
  using (public.current_user_role() = 'admin');

create policy "students_select_own"
  on public.students for select
  using (id = auth.uid());

create policy "students_update_admin"
  on public.students for update
  using (public.current_user_role() = 'admin');

-- No insert/delete policies, and deliberately no self-update policy: rows
-- are created by the enrollment server action (service-role client, same
-- pattern as `profiles`). Self-service edits (the personal-details page)
-- also go through a service-role action scoped to an explicit column list,
-- rather than a broad self-update RLS policy - RLS only restricts which
-- *rows* a student can touch, not which *columns*, so a direct-API student
-- update could otherwise rewrite class_level, fee_balance, or status.

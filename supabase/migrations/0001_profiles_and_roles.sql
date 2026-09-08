-- Identity + role for every signed-in user. Domain tables (students, staff,
-- invoices, ...) reference profiles.id and land in a later migration; this
-- one only covers "who is this and what portal do they belong in."

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'teacher', 'student')),
  -- Google staff sign-ups start "pending" until an admin approves them
  -- (see staff-google-auth.tsx copy). Student accounts are created directly
  -- by an admin, so they start active.
  status text not null default 'active' check (status in ('pending', 'active', 'suspended')),
  full_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER so RLS policies can check "is this user an admin?"
-- without recursively invoking RLS on profiles itself.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

-- No insert/delete policies: rows are created only by the trigger below
-- (new sign-ups) or by the service-role client (enrollment, staff removal),
-- both of which bypass RLS. Client-side inserts/deletes stay denied.

-- Populates profiles for every new auth.users row. Google OAuth sign-ups
-- carry no role metadata and default to "teacher" + "pending" (the least
-- privileged staff role, awaiting admin approval); accounts created via the
-- admin API for enrollment pass role: 'student' in user_metadata and land
-- active immediately.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(new.raw_user_meta_data ->> 'role', 'teacher');
begin
  insert into public.profiles (id, role, status, full_name, email)
  values (
    new.id,
    meta_role,
    case when meta_role = 'student' then 'active' else 'pending' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- `handle_new_user` previously trusted raw_user_meta_data->>'role' to decide
-- whether a brand-new signup landed as an active student or a pending staff
-- member. That metadata is client-controlled on any public signUp() call
-- (email/password, or the Auth REST API directly with the anon key) - so
-- anyone could request {"role": "student"} and get an active student
-- account with no enrollment record and no admin approval.
--
-- New rule: every self-service signup (Google OR email/password) always
-- lands as teacher + pending, full stop. Student accounts are never created
-- via this trigger's default - the enrollment flow (admin.students.enroll)
-- creates the auth user via the service-role admin API and then explicitly
-- promotes the resulting profile to role='student', status='active' itself,
-- which bypasses RLS legitimately because it's authenticated, admin-gated
-- server code, not client-suppliable metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, status, full_name, email)
  values (
    new.id,
    'teacher',
    'pending',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

-- Class Notes: teacher-uploaded files scoped to a class level + subject,
-- stored in Supabase Storage (bucket set up below) with only a pointer
-- (storage_path) kept in this table.
--
-- level/subject stay unconstrained text, mirroring class_teacher_subjects.
-- subject and how CLASS_LEVELS/SUBJECTS are app config, not DB rows.
-- exam_body is a small closed set, so it gets a check constraint, matching
-- the profiles.role/profiles.status convention.
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  subject text not null,
  exam_body text not null check (exam_body in ('ZIMSEC', 'Cambridge', 'Internal')),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "notes_select_admin"
  on public.notes for select
  using (public.current_user_role() = 'admin');

-- Teacher sees notes for any level they're assigned to (any subject at that
-- level, matching how the Notes/Reports lists already group by level with
-- subjects shown underneath - not narrowed to their exact subject).
create policy "notes_select_teacher"
  on public.notes for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      join public.classes c on c.id = cts.class_id
      where cts.teacher_id = auth.uid() and c.level = notes.level
    )
  );

-- Student sees only notes matching their own class_level.
create policy "notes_select_student"
  on public.notes for select
  using (
    exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.class_level = notes.level
    )
  );

-- No insert/update/delete policies: uploads/deletes go through a service-role
-- action that verifies (via class_teacher_subjects joined to classes) the
-- uploading teacher is actually assigned that exact level+subject.

insert into storage.buckets (id, name, public)
values ('class-notes', 'class-notes', false)
on conflict (id) do nothing;

-- No storage.objects policies: private bucket, default-deny for direct
-- client access. Every read and write goes through a service-role action
-- (signed URLs for downloads, .upload() for uploads) - matches how every
-- other write in this app is service-role-mediated.

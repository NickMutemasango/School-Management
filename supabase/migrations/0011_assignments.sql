-- Assignments: work a teacher sets against one exact class-subject
-- assignment (not just a level, like class-notes - a submission count needs
-- an exact roster), with an optional brief file and per-student submissions.
-- Storage/RLS convention matches notes (0007): private bucket, no write
-- policies, service-role actions enforce who can mutate what.
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_teacher_subject_id uuid not null references public.class_teacher_subjects (id) on delete cascade,
  title text not null,
  description text not null default '',
  due_on date not null,
  brief_storage_path text,
  brief_file_name text,
  brief_file_size bigint,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create policy "assignments_select_admin"
  on public.assignments for select
  using (public.current_user_role() = 'admin');

create policy "assignments_select_teacher"
  on public.assignments for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.id = assignments.class_teacher_subject_id and cts.teacher_id = auth.uid()
    )
  );

-- Reuses is_member_of_class() (migration 0009) - same SECURITY DEFINER
-- helper already used to avoid recursion between student_class_memberships
-- and class_teacher_subjects, so adding this policy can't reintroduce it.
create policy "assignments_select_student"
  on public.assignments for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.id = assignments.class_teacher_subject_id
        and public.is_member_of_class(cts.class_id)
    )
  );

-- No insert/update/delete policies: uploads go through a service-role action
-- that verifies the uploading teacher actually owns this class_teacher_subject
-- (same convention as notes/classes/timetable_entries).

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint not null,
  note text not null default '',
  submitted_at timestamptz not null default now(),
  -- One submission per student per assignment - resubmitting replaces it
  -- (upsert), matching student_class_memberships' single-row-per-student shape.
  unique (assignment_id, student_id)
);

alter table public.assignment_submissions enable row level security;

create policy "assignment_submissions_select_admin"
  on public.assignment_submissions for select
  using (public.current_user_role() = 'admin');

create policy "assignment_submissions_select_teacher"
  on public.assignment_submissions for select
  using (
    exists (
      select 1 from public.assignments a
      join public.class_teacher_subjects cts on cts.id = a.class_teacher_subject_id
      where a.id = assignment_submissions.assignment_id and cts.teacher_id = auth.uid()
    )
  );

create policy "assignment_submissions_select_own"
  on public.assignment_submissions for select
  using (student_id = auth.uid());

-- No insert/update/delete policies: submissions go through a service-role
-- action that verifies the submitting student is actually a member of the
-- assignment's class before upserting their own row.

insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', false)
on conflict (id) do nothing;

-- No storage.objects policies: private bucket, default-deny for direct
-- client access, same as class-notes - every read/write goes through a
-- service-role action (signed URLs for downloads, .upload() for uploads).

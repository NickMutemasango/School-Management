-- Student results: per-subject marks and comments entered by the owning
-- subject teacher, plus one shared per-class "class teacher" remark. Both
-- give app/teacher/reports, app/admin/reports, and app/student/results a
-- real backend for the first time - lib/data/student-results.ts and
-- lib/data/teacher-reports.ts have been empty frontend contracts until now.
--
-- There's no "class teacher" (homeroom) role distinct from a subject
-- teacher anywhere in this schema - class_term_remarks is deliberately
-- writable by *any* teacher assigned to the class (any subject), not a
-- single designated owner, since there's nothing to designate one against
-- yet. headComment in the frontend TermResult type stays unbacked (no
-- "head of school" role modeled either) - a natural follow-up once a real
-- staff-hierarchy concept exists.
--
-- No publish/draft gate: a saved mark is immediately visible to the
-- student it belongs to, same as every other teacher-authored artifact in
-- this app (notes, assignments) - there's no release-date concept to gate
-- on. TermResult.average/position/classSize and SubjectResult.classPosition/
-- classSize are NOT stored here - they're computed at read time from the
-- class's full set of rows (app/student/results/page.tsx), so a later mark
-- edit can never leave a stale rank behind.

create table public.subject_results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_teacher_subject_id uuid not null references public.class_teacher_subjects (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  term text not null,
  academic_year integer not null,
  mark numeric(5, 2) not null check (mark >= 0 and mark <= 100),
  teacher_comment text not null default '',
  updated_at timestamptz not null default now(),
  unique (class_teacher_subject_id, student_id, term, academic_year)
);

alter table public.subject_results enable row level security;

create policy "subject_results_select_admin"
  on public.subject_results for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

create policy "subject_results_select_teacher"
  on public.subject_results for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.id = subject_results.class_teacher_subject_id and cts.teacher_id = auth.uid()
    )
  );

create policy "subject_results_select_own"
  on public.subject_results for select
  using (student_id = auth.uid());

-- No insert/update/delete policies: every write goes through a service-role
-- action (app/teacher/reports/actions.ts) that first confirms the signed-in
-- teacher actually owns this class_teacher_subject_id - same "RLS covers
-- reads, the action enforces writes" convention as notes/assignments.

-- Classmates' marks for the same class-subject/term need to be readable by
-- every student in the class (not just their own row) to compute
-- SubjectResult.classPosition/classSize - reuses is_member_of_class()
-- (migration 0009) rather than a new helper.
create policy "subject_results_select_classmate"
  on public.subject_results for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.id = subject_results.class_teacher_subject_id
        and public.is_member_of_class(cts.class_id)
    )
  );

create table public.class_term_remarks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  term text not null,
  academic_year integer not null,
  class_teacher_comment text not null default '',
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (class_id, term, academic_year)
);

alter table public.class_term_remarks enable row level security;

create policy "class_term_remarks_select_admin"
  on public.class_term_remarks for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

create policy "class_term_remarks_select_teacher"
  on public.class_term_remarks for select
  using (public.is_teacher_of_class(class_id));

create policy "class_term_remarks_select_student"
  on public.class_term_remarks for select
  using (public.is_member_of_class(class_id));

-- No insert/update/delete policies: written via a service-role action that
-- confirms the signed-in teacher is assigned to this class (any subject).

create index subject_results_class_teacher_subject_id_idx on public.subject_results (class_teacher_subject_id);
create index subject_results_student_id_idx on public.subject_results (student_id);
create index class_term_remarks_class_id_idx on public.class_term_remarks (class_id);

-- Places an enrolled student in one class section (their subject
-- assignments come from the class itself via class_teacher_subjects, not
-- stored per-student). This is deliberately a separate step from
-- enrollment - a student can be enrolled at a level before an admin sorts
-- them into a specific section.
--
-- Also adds the read access this unlocks: a teacher can see students in
-- their own classes, and a student can see their classmates and which
-- teachers/subjects are assigned to their own class.
create table public.student_class_memberships (
  student_id uuid primary key references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.student_class_memberships enable row level security;

create policy "student_class_memberships_select_admin"
  on public.student_class_memberships for select
  using (public.current_user_role() = 'admin');

create policy "student_class_memberships_select_teacher"
  on public.student_class_memberships for select
  using (
    exists (
      select 1 from public.class_teacher_subjects cts
      where cts.class_id = student_class_memberships.class_id
        and cts.teacher_id = auth.uid()
    )
  );

create policy "student_class_memberships_select_own"
  on public.student_class_memberships for select
  using (student_id = auth.uid());

-- No insert/update/delete policies: memberships are set/cleared only via
-- service-role admin actions (same convention as classes/class_teacher_subjects).

-- Teachers can read basic details for students in classes they teach.
create policy "students_select_teacher_class"
  on public.students for select
  using (
    exists (
      select 1
      from public.student_class_memberships scm
      join public.class_teacher_subjects cts on cts.class_id = scm.class_id
      where scm.student_id = students.id and cts.teacher_id = auth.uid()
    )
  );

-- A student can see other students who share their class section.
create policy "students_select_classmate"
  on public.students for select
  using (
    exists (
      select 1
      from public.student_class_memberships mine
      join public.student_class_memberships theirs on theirs.class_id = mine.class_id
      where mine.student_id = auth.uid()
        and theirs.student_id = students.id
    )
  );

-- A student can see the teacher/subject assignments for their own class.
create policy "class_teacher_subjects_select_own_class"
  on public.class_teacher_subjects for select
  using (
    exists (
      select 1 from public.student_class_memberships scm
      where scm.student_id = auth.uid()
        and scm.class_id = class_teacher_subjects.class_id
    )
  );

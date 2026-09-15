-- Per-subject classroom policies (late-work rules, grading conventions,
-- etc.), admin-authored and shown to students on their class hub page.
-- No RLS change needed: class_teacher_subjects_select_admin/_teacher/
-- _own_class (migrations 0005, 0008) already cover every reader this needs.
-- Writes go through a service-role action gated by requireActiveAdmin(),
-- same no-write-RLS convention as the rest of this table.
alter table public.class_teacher_subjects
  add column policies text not null default '';

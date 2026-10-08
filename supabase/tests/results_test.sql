-- Regression suite for migration 0021 (results): proves subject_results is
-- visible to the owning teacher, the owning student, and every classmate in
-- the same class-subject (needed to rank classPosition/classSize) - but
-- never to a student in a different class, nor across schools. Same shape
-- for class_term_remarks. Run with `supabase test db`.
--
-- Self-contained (own School A/B, admins, teachers, classes, students) -
-- each test file runs in its own transaction, so there's nothing to share.
BEGIN;
SELECT plan(14);

-- ---------------------------------------------------------------------
-- Fixtures (run as the migration/superuser role, which bypasses RLS)
-- ---------------------------------------------------------------------

insert into public.organisations (id, name)
  values ('30000000-0000-0000-0000-000000000001', 'Org B (results test)');
insert into public.schools (id, organisation_id, name, code)
  values ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'School B (results test)', 'school-b-results-test');

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('30000000-0000-0000-0000-0000000000a1', 'admin-a@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('30000000-0000-0000-0000-0000000000b1', 'admin-b@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('30000000-0000-0000-0000-0000000000f1', 'teacher-a@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('30000000-0000-0000-0000-0000000000f2', 'teacher-other@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('30000000-0000-0000-0000-0000000000c1', 'student-c@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('30000000-0000-0000-0000-0000000000d1', 'student-d@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('30000000-0000-0000-0000-0000000000e1', 'student-e@results-test.local', 'x', now(), '{}', 'authenticated', 'authenticated');

update public.profiles set role = 'admin', status = 'active'
  where id = '30000000-0000-0000-0000-0000000000a1';
update public.profiles set role = 'admin', status = 'active', school_id = '30000000-0000-0000-0000-000000000001'
  where id = '30000000-0000-0000-0000-0000000000b1';
update public.profiles set role = 'teacher', status = 'active'
  where id in ('30000000-0000-0000-0000-0000000000f1', '30000000-0000-0000-0000-0000000000f2');
-- Students C and D share School A's "Results-A" class; E is School A too,
-- but in a *different* class - proves classmate visibility doesn't leak
-- past the class boundary, not just the school boundary.
update public.profiles set role = 'student', status = 'active'
  where id in ('30000000-0000-0000-0000-0000000000c1', '30000000-0000-0000-0000-0000000000d1', '30000000-0000-0000-0000-0000000000e1');

insert into public.classes (level, section) values ('GRADE 5', 'Results-A');
insert into public.classes (level, section) values ('GRADE 5', 'Results-A-Other');

insert into public.class_teacher_subjects (class_id, teacher_id, subject)
select id, '30000000-0000-0000-0000-0000000000f1', 'Mathematics' from public.classes where section = 'Results-A';
insert into public.class_teacher_subjects (class_id, teacher_id, subject)
select id, '30000000-0000-0000-0000-0000000000f2', 'Mathematics' from public.classes where section = 'Results-A-Other';

insert into public.students (id, reg_number, first_name, last_name, class_level)
values
  ('30000000-0000-0000-0000-0000000000c1', 'RES-TEST-0001', 'Test', 'StudentC', 'GRADE 5'),
  ('30000000-0000-0000-0000-0000000000d1', 'RES-TEST-0002', 'Test', 'StudentD', 'GRADE 5'),
  ('30000000-0000-0000-0000-0000000000e1', 'RES-TEST-0003', 'Test', 'StudentE', 'GRADE 5');

insert into public.student_class_memberships (student_id, class_id)
select '30000000-0000-0000-0000-0000000000c1', id from public.classes where section = 'Results-A';
insert into public.student_class_memberships (student_id, class_id)
select '30000000-0000-0000-0000-0000000000d1', id from public.classes where section = 'Results-A';
insert into public.student_class_memberships (student_id, class_id)
select '30000000-0000-0000-0000-0000000000e1', id from public.classes where section = 'Results-A-Other';

insert into public.subject_results (school_id, class_teacher_subject_id, student_id, term, academic_year, mark)
select '00000000-0000-0000-0000-000000000001', cts.id, '30000000-0000-0000-0000-0000000000c1', 'Term 1', 2026, 70
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id where c.section = 'Results-A';

insert into public.subject_results (school_id, class_teacher_subject_id, student_id, term, academic_year, mark)
select '00000000-0000-0000-0000-000000000001', cts.id, '30000000-0000-0000-0000-0000000000d1', 'Term 1', 2026, 80
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id where c.section = 'Results-A';

-- School B has its own row (same unique key values, different school) -
-- proves cross-school isolation on this table, same convention as
-- supabase/tests/school_scoping_test.sql and finance_test.sql.
insert into public.subject_results (school_id, class_teacher_subject_id, student_id, term, academic_year, mark)
select '30000000-0000-0000-0000-000000000001', cts.id, '30000000-0000-0000-0000-0000000000e1', 'Term 1', 2026, 90
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id where c.section = 'Results-A-Other';

insert into public.class_term_remarks (school_id, class_id, term, academic_year, class_teacher_comment)
select '00000000-0000-0000-0000-000000000001', id, 'Term 1', 2026, 'Great progress this term.'
from public.classes where section = 'Results-A';

-- ---------------------------------------------------------------------
-- Admin A (School A) / Admin B (School B)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.subject_results), 2::bigint, 'admin A sees only School A''s two subject_results rows');
SELECT is((select count(*) from public.class_term_remarks), 1::bigint, 'admin A sees School A''s class_term_remarks row');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.subject_results), 1::bigint, 'admin B sees only School B''s subject_results row');
SELECT is((select count(*) from public.class_term_remarks), 0::bigint, 'admin B sees zero class_term_remarks (School A''s only)');
reset role;

-- ---------------------------------------------------------------------
-- Teacher A (owns Results-A) vs. Teacher-Other (owns Results-A-Other)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000f1', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.subject_results), 2::bigint, 'teacher A sees both students'' marks in their own class-subject');
SELECT is((select count(*) from public.class_term_remarks), 1::bigint, 'teacher A (assigned to the class) sees its remark');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000f2', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.subject_results), 1::bigint, 'teacher-other sees only their own class-subject''s row, not Results-A''s');
reset role;

-- ---------------------------------------------------------------------
-- Student C / D (classmates in Results-A) vs. Student E (different class)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);
SELECT is(
  (select count(*) from public.subject_results), 2::bigint,
  'student C sees both their own and classmate D''s mark (needed to rank classPosition/classSize)'
);
SELECT is((select count(*) from public.class_term_remarks), 1::bigint, 'student C sees their class''s remark');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000d1', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.subject_results), 2::bigint, 'student D sees both their own and classmate C''s mark');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '30000000-0000-0000-0000-0000000000e1', 'role', 'authenticated')::text, true);
SELECT is(
  (select count(*) from public.subject_results), 1::bigint,
  'student E (different class, same school) cannot see Results-A''s marks, only their own'
);
SELECT is(
  (select count(*) from public.class_term_remarks), 0::bigint,
  'student E cannot see Results-A''s remark - they are not a member of that class'
);
reset role;

-- ---------------------------------------------------------------------
-- Anon
-- ---------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
SELECT is((select count(*) from public.subject_results), 0::bigint, 'anon sees zero subject_results');
SELECT is((select count(*) from public.class_term_remarks), 0::bigint, 'anon sees zero class_term_remarks');
reset role;

SELECT * FROM finish();
ROLLBACK;

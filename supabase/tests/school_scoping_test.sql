-- Regression suite for migrations 0015-0019: proves the tenant-isolation
-- claim (admin at School A can never see School B's rows, and vice versa),
-- the suspended-admin lockout, the classes.school_level_offering_id sync
-- trigger, (0018) that a teacher/student can't read the other school's
-- class notes when both schools happen to share a curriculum level label,
-- and (0019) that the same isolation still holds after the RLS-performance
-- rewrite - the same scenarios validated by hand against a local db reset
-- before these migrations were considered done, now made repeatable. Run
-- with `supabase test db`.
--
-- School A is the school_id = ...0001 row seeded by 0015 itself, so this
-- file only has to create School B plus two admins. 7 of the 11 policies
-- migration 0016 tightened are exercised directly (profiles_select_admin,
-- classes_select_admin, students_select_admin, class_teacher_subjects_
-- select_admin, timetable_entries_select_admin, assignments_select_admin,
-- student_class_memberships_select_admin). Remaining untested:
-- profiles_update_admin and students_update_admin (UPDATE-only, would need
-- a separate mutation-side test), notes_select_admin and
-- assignment_submissions_select_admin (SELECT, same shape as the 7 above -
-- lower priority since that shape is now itself covered, not just asserted
-- by comment).
BEGIN;
SELECT plan(34);

-- ---------------------------------------------------------------------
-- Fixtures (run as the migration/superuser role, which bypasses RLS)
-- ---------------------------------------------------------------------

insert into public.organisations (id, name)
  values ('10000000-0000-0000-0000-000000000001', 'Org B (test)');
insert into public.schools (id, organisation_id, name, code)
  values ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'School B (test)', 'school-b-test');

-- Inserting into auth.users fires handle_new_user() (migration 0001/0004),
-- which creates each profile as role='teacher', status='pending',
-- school_id=default (via the 0015 column default) - promote both to active
-- admins afterward, same as the real approval flow would.
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('10000000-0000-0000-0000-0000000000a1', 'admin-a@school-scoping-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-0000000000b1', 'admin-b@school-scoping-test.local', 'x', now(), '{}', 'authenticated', 'authenticated');

update public.profiles set role = 'admin', status = 'active'
  where id = '10000000-0000-0000-0000-0000000000a1';
update public.profiles set role = 'admin', status = 'active', school_id = '10000000-0000-0000-0000-000000000001'
  where id = '10000000-0000-0000-0000-0000000000b1';

-- Activate GRADE 5 for School A this year (trigger positive case) *before*
-- creating any class - the sync trigger only resolves against offerings
-- that already exist at insert time. School B's FORM 1 is deliberately left
-- unactivated (trigger negative case).
insert into public.school_level_offerings (school_id, level_definition_id, academic_year)
select '00000000-0000-0000-0000-000000000001', id, extract(year from now())::integer
from public.level_definitions where display_label = 'GRADE 5';

-- One class per school, created the same way the real createClass() action
-- does it (level + section, no school_id - relies on the 0015 default),
-- except School B's class needs school_id passed explicitly since the
-- default points at School A.
insert into public.classes (level, section) values ('GRADE 5', 'Scoping-A');
insert into public.classes (level, section, school_id)
  values ('FORM 1', 'Scoping-B', '10000000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------
-- Trigger: classes.school_level_offering_id sync (migration 0017)
-- ---------------------------------------------------------------------

SELECT ok(
  (select school_level_offering_id from public.classes where section = 'Scoping-A') is not null,
  'an activated level resolves school_level_offering_id on insert'
);
SELECT ok(
  (select school_level_offering_id from public.classes where section = 'Scoping-B') is null,
  'an unactivated level leaves school_level_offering_id null instead of erroring'
);

-- ---------------------------------------------------------------------
-- Admin A (School A / the 0015 seed school)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.schools), 1::bigint, 'admin A sees exactly one school');
SELECT is((select code from public.schools limit 1), 'default', 'admin A''s visible school is their own (School A)');
SELECT is((select count(*) from public.classes where section like 'Scoping-%'), 1::bigint, 'admin A sees only School A''s scoping-test class');
SELECT is((select section from public.classes where section like 'Scoping-%' limit 1), 'Scoping-A', 'admin A''s visible class is School A''s');
SELECT is(
  (select count(*) from public.profiles where id = '10000000-0000-0000-0000-0000000000a1'), 1::bigint,
  'admin A can read their own profile'
);
SELECT is(
  (select count(*) from public.profiles where id = '10000000-0000-0000-0000-0000000000b1'), 0::bigint,
  'admin A cannot read admin B''s profile (School B)'
);

reset role;

-- ---------------------------------------------------------------------
-- Admin B (School B, created above)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.schools), 1::bigint, 'admin B sees exactly one school');
SELECT is((select code from public.schools limit 1), 'school-b-test', 'admin B''s visible school is their own (School B)');
SELECT is((select count(*) from public.classes where section like 'Scoping-%'), 1::bigint, 'admin B sees only School B''s scoping-test class');
SELECT is((select section from public.classes where section like 'Scoping-%' limit 1), 'Scoping-B', 'admin B''s visible class is School B''s');
SELECT is(
  (select count(*) from public.level_definitions), 15::bigint,
  'admin B (a different school) still reads the full global level_definitions catalogue'
);

reset role;

-- ---------------------------------------------------------------------
-- Suspended admin loses all school-scoped access immediately
-- ---------------------------------------------------------------------

update public.profiles set status = 'suspended' where id = '10000000-0000-0000-0000-0000000000a1';

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.schools), 0::bigint, 'suspended admin sees zero schools');
SELECT is((select count(*) from public.classes), 0::bigint, 'suspended admin sees zero classes');
SELECT is((select public.current_user_role()), null, 'suspended admin resolves no role');
SELECT is((select public.current_user_school_id()), null, 'suspended admin resolves no school');

reset role;

-- ---------------------------------------------------------------------
-- Unauthenticated (anon) sees nothing, including the "world-readable to
-- authenticated users" reference tables
-- ---------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

SELECT is((select count(*) from public.schools), 0::bigint, 'anon sees zero schools');
SELECT is((select count(*) from public.classes), 0::bigint, 'anon sees zero classes');
SELECT is(
  (select count(*) from public.level_definitions), 0::bigint,
  'anon cannot read level_definitions even though it is authenticated-wide readable'
);

reset role;

-- ---------------------------------------------------------------------
-- notes_select_teacher / notes_select_student school scoping (migration
-- 0018): both schools activate the identical curriculum level label
-- ("GRADE 5") and each uploads a note under it - proves a teacher/student
-- at one school can no longer read the other school's notes just because
-- the level text matches, which was the exact gap 0018 closed.
-- ---------------------------------------------------------------------

insert into public.classes (level, section, school_id)
  values ('GRADE 5', 'B-Notes', '10000000-0000-0000-0000-000000000001');

-- Reuses admin-A/admin-B's auth identities as the "teacher" on each side -
-- notes_select_teacher only checks `cts.teacher_id = auth.uid()`, not the
-- profile's role or status, so this is a faithful test of the policy even
-- though admin-A was suspended above and these two are role='admin' rows.
insert into public.class_teacher_subjects (class_id, teacher_id, subject, school_id)
select id, '10000000-0000-0000-0000-0000000000a1', 'Mathematics', school_id
from public.classes where section = 'Scoping-A';

insert into public.class_teacher_subjects (class_id, teacher_id, subject, school_id)
select id, '10000000-0000-0000-0000-0000000000b1', 'Mathematics', school_id
from public.classes where section = 'B-Notes';

insert into public.notes (level, subject, exam_body, teacher_id, file_name, storage_path, file_size, school_id)
values (
  'GRADE 5', 'Mathematics', 'Internal', '10000000-0000-0000-0000-0000000000a1',
  'notes-a.pdf', 'test/notes-a.pdf', 1024, '00000000-0000-0000-0000-000000000001'
);
insert into public.notes (level, subject, exam_body, teacher_id, file_name, storage_path, file_size, school_id)
values (
  'GRADE 5', 'Mathematics', 'Internal', '10000000-0000-0000-0000-0000000000b1',
  'notes-b.pdf', 'test/notes-b.pdf', 1024, '10000000-0000-0000-0000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);
SELECT is(
  (select count(*) from public.notes where level = 'GRADE 5'), 1::bigint,
  'teacher at School A sees only School A''s GRADE 5 notes, not School B''s'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);
SELECT is(
  (select count(*) from public.notes where level = 'GRADE 5'), 1::bigint,
  'teacher at School B sees only School B''s GRADE 5 notes, not School A''s'
);
reset role;

-- Two students, one per school, both enrolled at the same "GRADE 5" label.
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('10000000-0000-0000-0000-0000000000c1', 'student-c@school-scoping-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-0000000000d1', 'student-d@school-scoping-test.local', 'x', now(), '{}', 'authenticated', 'authenticated');

update public.profiles set role = 'student', status = 'active'
  where id = '10000000-0000-0000-0000-0000000000c1';
update public.profiles set role = 'student', status = 'active', school_id = '10000000-0000-0000-0000-000000000001'
  where id = '10000000-0000-0000-0000-0000000000d1';

insert into public.students (id, reg_number, first_name, last_name, class_level, school_id)
values ('10000000-0000-0000-0000-0000000000c1', 'TEST-SCOPE-0001', 'Test', 'StudentC', 'GRADE 5', '00000000-0000-0000-0000-000000000001');
insert into public.students (id, reg_number, first_name, last_name, class_level, school_id)
values ('10000000-0000-0000-0000-0000000000d1', 'TEST-SCOPE-0002', 'Test', 'StudentD', 'GRADE 5', '10000000-0000-0000-0000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);
SELECT is(
  (select count(*) from public.notes where level = 'GRADE 5'), 1::bigint,
  'student at School A sees only School A''s GRADE 5 notes, not School B''s'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000d1', 'role', 'authenticated')::text, true);
SELECT is(
  (select count(*) from public.notes where level = 'GRADE 5'), 1::bigint,
  'student at School B sees only School B''s GRADE 5 notes, not School A''s'
);
reset role;

-- ---------------------------------------------------------------------
-- Broader coverage for migration 0016's *_select_admin policies (and their
-- 0019 rewrite): reuses the class_teacher_subjects/students fixtures from
-- the notes section above. admin-A is reactivated here (suspended earlier
-- in this file) since these checks need an active admin session.
-- ---------------------------------------------------------------------

update public.profiles set status = 'active' where id = '10000000-0000-0000-0000-0000000000a1';

insert into public.timetable_entries (class_teacher_subject_id, teacher_id, class_id, day, period_id, room, school_id)
select cts.id, cts.teacher_id, cts.class_id, 'Monday', 'p1', 'Room A', cts.school_id
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id
where c.section = 'Scoping-A';

insert into public.timetable_entries (class_teacher_subject_id, teacher_id, class_id, day, period_id, room, school_id)
select cts.id, cts.teacher_id, cts.class_id, 'Monday', 'p1', 'Room B', cts.school_id
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id
where c.section = 'B-Notes';

insert into public.assignments (class_teacher_subject_id, title, due_on, school_id)
select cts.id, 'Scoping test assignment A', current_date, cts.school_id
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id
where c.section = 'Scoping-A';

insert into public.assignments (class_teacher_subject_id, title, due_on, school_id)
select cts.id, 'Scoping test assignment B', current_date, cts.school_id
from public.class_teacher_subjects cts
join public.classes c on c.id = cts.class_id
where c.section = 'B-Notes';

insert into public.student_class_memberships (student_id, class_id, school_id)
select '10000000-0000-0000-0000-0000000000c1', c.id, c.school_id
from public.classes c where c.section = 'Scoping-A';

insert into public.student_class_memberships (student_id, class_id, school_id)
select '10000000-0000-0000-0000-0000000000d1', c.id, c.school_id
from public.classes c where c.section = 'B-Notes';

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.students), 1::bigint, 'admin A sees only School A''s student via students_select_admin');
SELECT is((select count(*) from public.class_teacher_subjects), 1::bigint, 'admin A sees only School A''s teaching assignment');
SELECT is((select count(*) from public.timetable_entries), 1::bigint, 'admin A sees only School A''s timetable entry');
SELECT is((select count(*) from public.assignments), 1::bigint, 'admin A sees only School A''s assignment');
SELECT is((select count(*) from public.student_class_memberships), 1::bigint, 'admin A sees only School A''s class membership');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '10000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);
SELECT is((select count(*) from public.students), 1::bigint, 'admin B sees only School B''s student via students_select_admin');
SELECT is((select count(*) from public.class_teacher_subjects), 1::bigint, 'admin B sees only School B''s teaching assignment');
SELECT is((select count(*) from public.timetable_entries), 1::bigint, 'admin B sees only School B''s timetable entry');
SELECT is((select count(*) from public.assignments), 1::bigint, 'admin B sees only School B''s assignment');
SELECT is((select count(*) from public.student_class_memberships), 1::bigint, 'admin B sees only School B''s class membership');
reset role;

SELECT * FROM finish();
ROLLBACK;

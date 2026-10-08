-- Regression suite for migration 0020 (finance): proves fee_structure_lines
-- is admin-only and school-scoped, invoices/invoice_line_items/payments are
-- visible to the owning school's admin and to the student they're billed
-- to, and that none of it leaks across schools or to an unrelated student
-- in the *same* school. Run with `supabase test db`.
--
-- Self-contained (own School A/B, admins, students) rather than reusing
-- supabase/tests/school_scoping_test.sql's fixtures - each test file runs
-- in its own transaction, so there's nothing to share anyway.
BEGIN;
SELECT plan(17);

-- ---------------------------------------------------------------------
-- Fixtures (run as the migration/superuser role, which bypasses RLS)
-- ---------------------------------------------------------------------

insert into public.organisations (id, name)
  values ('20000000-0000-0000-0000-000000000001', 'Org B (finance test)');
insert into public.schools (id, organisation_id, name, code)
  values ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'School B (finance test)', 'school-b-finance-test');

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('20000000-0000-0000-0000-0000000000a1', 'admin-a@finance-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-0000000000b1', 'admin-b@finance-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-0000000000c1', 'student-c@finance-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-0000000000d1', 'student-d@finance-test.local', 'x', now(), '{}', 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-0000000000e1', 'student-e@finance-test.local', 'x', now(), '{}', 'authenticated', 'authenticated');

update public.profiles set role = 'admin', status = 'active'
  where id = '20000000-0000-0000-0000-0000000000a1';
update public.profiles set role = 'admin', status = 'active', school_id = '20000000-0000-0000-0000-000000000001'
  where id = '20000000-0000-0000-0000-0000000000b1';
-- Student C and student E are both School A - used to prove one student
-- can't see another's invoice even inside the same school.
update public.profiles set role = 'student', status = 'active'
  where id in ('20000000-0000-0000-0000-0000000000c1', '20000000-0000-0000-0000-0000000000e1');
update public.profiles set role = 'student', status = 'active', school_id = '20000000-0000-0000-0000-000000000001'
  where id = '20000000-0000-0000-0000-0000000000d1';

insert into public.students (id, reg_number, first_name, last_name, class_level, school_id)
values
  ('20000000-0000-0000-0000-0000000000c1', 'FIN-TEST-0001', 'Student', 'C', 'GRADE 5', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-0000000000d1', 'FIN-TEST-0002', 'Student', 'D', 'GRADE 5', '20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-0000000000e1', 'FIN-TEST-0003', 'Student', 'E', 'GRADE 5', '00000000-0000-0000-0000-000000000001');

insert into public.fee_structure_lines (school_id, category, primary_amount)
values
  ('00000000-0000-0000-0000-000000000001', 'Tuition (School A)', 500),
  ('20000000-0000-0000-0000-000000000001', 'Tuition (School B)', 600);

insert into public.invoices (id, school_id, student_id, invoice_number, term, due_on, amount)
values
  ('20000000-0000-0000-0000-00000000f0a1', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-0000000000c1', 'FIN-TEST-INV-A', 'Term 1', current_date, 500),
  ('20000000-0000-0000-0000-00000000f0b1', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-0000000000d1', 'FIN-TEST-INV-B', 'Term 1', current_date, 600);

insert into public.invoice_line_items (invoice_id, category, amount)
values
  ('20000000-0000-0000-0000-00000000f0a1', 'Tuition', 500),
  ('20000000-0000-0000-0000-00000000f0b1', 'Tuition', 600);

insert into public.payments (school_id, invoice_id, student_id, reference, method, amount)
values
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-00000000f0a1', '20000000-0000-0000-0000-0000000000c1', 'PMT-TEST-A', 'Cash', 200),
  ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-00000000f0b1', '20000000-0000-0000-0000-0000000000d1', 'PMT-TEST-B', 'Cash', 300);

-- ---------------------------------------------------------------------
-- Admin A (School A)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '20000000-0000-0000-0000-0000000000a1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.fee_structure_lines), 1::bigint, 'admin A sees only School A''s fee line');
SELECT is((select category from public.fee_structure_lines limit 1), 'Tuition (School A)', 'admin A''s visible fee line is School A''s');
SELECT is((select count(*) from public.invoices), 1::bigint, 'admin A sees only School A''s invoice');
SELECT is((select count(*) from public.invoice_line_items), 1::bigint, 'admin A sees only School A''s invoice line item (via the invoice join)');
SELECT is((select count(*) from public.payments), 1::bigint, 'admin A sees only School A''s payment');

reset role;

-- ---------------------------------------------------------------------
-- Admin B (School B)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '20000000-0000-0000-0000-0000000000b1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.fee_structure_lines), 1::bigint, 'admin B sees only School B''s fee line');
SELECT is((select category from public.fee_structure_lines limit 1), 'Tuition (School B)', 'admin B''s visible fee line is School B''s');
SELECT is((select count(*) from public.invoices), 1::bigint, 'admin B sees only School B''s invoice');
SELECT is((select count(*) from public.invoice_line_items), 1::bigint, 'admin B sees only School B''s invoice line item');
SELECT is((select count(*) from public.payments), 1::bigint, 'admin B sees only School B''s payment');

reset role;

-- ---------------------------------------------------------------------
-- Student C (School A, owns the School A invoice)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '20000000-0000-0000-0000-0000000000c1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.fee_structure_lines), 0::bigint, 'a student cannot read fee_structure_lines at all - admin-only');
SELECT is((select count(*) from public.invoices), 1::bigint, 'student C sees exactly their own invoice');
SELECT is((select invoice_number from public.invoices limit 1), 'FIN-TEST-INV-A', 'student C''s visible invoice is their own');
SELECT is((select count(*) from public.invoice_line_items), 1::bigint, 'student C sees their own invoice''s line item');
SELECT is((select count(*) from public.payments), 1::bigint, 'student C sees their own payment');

reset role;

-- ---------------------------------------------------------------------
-- Student E (School A, but a different student from C - owns nothing)
-- ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '20000000-0000-0000-0000-0000000000e1', 'role', 'authenticated')::text, true);

SELECT is((select count(*) from public.invoices), 0::bigint, 'student E (same school, different student) cannot see student C''s invoice');
SELECT is((select count(*) from public.payments), 0::bigint, 'student E cannot see student C''s payment');

reset role;

SELECT * FROM finish();
ROLLBACK;

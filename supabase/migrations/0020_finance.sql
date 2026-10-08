-- Finance: fee structure, invoices, and payments. Everything in
-- lib/data/finance.ts and lib/data/student-fees.ts has been a frontend-only
-- data contract (empty arrays) until now - this migration gives the Finance
-- Overview, Invoices, Fee Structure, and student Fees screens a real backend.
--
-- Shape mirrors the existing conventions: every table carries its own
-- school_id (explicit, no default - same as school_level_offerings in
-- migration 0017, since this table is new rather than being retrofitted
-- onto a pre-tenancy table), no insert/update/delete RLS policies (every
-- mutation goes through a service-role action gated by requireActiveAdmin(),
-- same as classes/school_level_offerings), and child rows (invoice_line_items,
-- payments) resolve their tenancy through the parent invoice or carry their
-- own school_id where a direct admin-scoped policy is simpler than a join.
--
-- amountPaid/status (Invoice) and totalPaid/outstanding (FeeStatement) are
-- deliberately NOT stored columns - they're derived from payments at read
-- time (app/admin/finance/*, app/student/fees/page.tsx), so a payment can
-- never drift out of sync with the invoice it's against.
--
-- Deliberately out of scope here: "send reminder" (needs an email flow,
-- see lib/email/) and draft invoices (no draft state in the status model -
-- an invoice exists the moment it's issued).

create table public.fee_structure_lines (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  category text not null,
  description text not null default '',
  ecd_amount numeric(10, 2) not null default 0,
  primary_amount numeric(10, 2) not null default 0,
  secondary_amount numeric(10, 2) not null default 0,
  a_level_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fee_structure_lines enable row level security;

create policy "fee_structure_lines_select_admin"
  on public.fee_structure_lines for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

-- No insert/update/delete policies: managed only via a service-role action
-- (app/admin/finance/actions.ts), gated by requireActiveAdmin().

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  invoice_number text not null,
  term text not null,
  issued_on date not null default current_date,
  due_on date not null,
  amount numeric(10, 2) not null check (amount >= 0),
  -- Voided rather than deleted: keeps the invoice_number from being reused
  -- and any payments already recorded against it stay on the books instead
  -- of cascading away.
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (school_id, invoice_number)
);

alter table public.invoices enable row level security;

create policy "invoices_select_admin"
  on public.invoices for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

create policy "invoices_select_own"
  on public.invoices for select
  using (student_id = auth.uid());

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  category text not null,
  description text not null default '',
  amount numeric(10, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

alter table public.invoice_line_items enable row level security;

create policy "invoice_line_items_select_admin"
  on public.invoice_line_items for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.current_user_role() = 'admin'
        and i.school_id = public.current_user_school_id()
    )
  );

create policy "invoice_line_items_select_own"
  on public.invoice_line_items for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id and i.student_id = auth.uid()
    )
  );

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  -- Denormalized from invoices.student_id: lets "own" RLS and the student
  -- fee statement query payments directly without a join.
  student_id uuid not null references public.students (id) on delete cascade,
  reference text not null,
  method text not null check (method in ('EcoCash', 'Bank Transfer', 'Cash', 'Card')),
  amount numeric(10, 2) not null check (amount > 0),
  paid_on date not null default current_date,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_admin"
  on public.payments for select
  using (public.current_user_role() = 'admin' and school_id = public.current_user_school_id());

create policy "payments_select_own"
  on public.payments for select
  using (student_id = auth.uid());

create index fee_structure_lines_school_id_idx on public.fee_structure_lines (school_id);
create index invoices_school_id_idx on public.invoices (school_id);
create index invoices_student_id_idx on public.invoices (student_id);
create index invoice_line_items_invoice_id_idx on public.invoice_line_items (invoice_id);
create index payments_school_id_idx on public.payments (school_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create index payments_student_id_idx on public.payments (student_id);

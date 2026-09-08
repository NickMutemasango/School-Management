# Supabase setup

## 1. Create the project

Create a free project at https://supabase.com/dashboard. Note the **Project
URL**, **anon public key**, and **service_role key** from
Project Settings → API.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the three keys above, plus:

- `STUDENT_AUTH_EMAIL_DOMAIN` — any domain you own or a made-up one (e.g.
  `students.<yourschool>.internal`). It never receives mail; it's only used
  to turn a registration number into a Supabase Auth identity.
- `NEXT_PUBLIC_STAFF_GOOGLE_HD` — optional, restricts the Google sign-in
  picker to your Workspace domain.
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — see step 5.

## 3. Enable Google sign-in for staff

In the dashboard: **Authentication → Providers → Google** → enable it, and
supply a Client ID/Secret from a Google Cloud OAuth consent screen. Add this
as an **Authorized redirect URI** on the Google OAuth client:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

Email/password sign-in (the alternative to Google on `/login/staff`) is
enabled by default on every Supabase project - nothing to configure there.
One setting worth checking: **Authentication → Providers → Email → Confirm
email**. If it's on (the default), a new password sign-up won't get a
session until they click a confirmation link Supabase emails them; if it's
off, they're signed in immediately. Either way lands them as `pending` -
this only affects how many clicks it takes to get there.

## 4. Run the migrations

Run every file in `supabase/migrations/` in order, either by pasting each
into the dashboard's **SQL Editor**, or from the terminal:

```bash
supabase db push --db-url "postgresql://postgres:YOUR_PASSWORD@db.<project-ref>.supabase.co:5432/postgres"
```

- `0001_profiles_and_roles.sql` — `profiles` (one row per signed-in user:
  `role` admin/teacher/student, `status` pending/active/suspended) with RLS,
  and a trigger that populates it on sign-up
- `0002_profiles_notified_at.sql` — tracks whether the "pending approval"
  email has already been sent for a given account
- `0003_students.sql` — `students`, one row per enrolled student, RLS
  (self-select only; no self-update - see the migration's comment)
- `0004_fix_role_privilege_escalation.sql` — **security fix**: the original
  trigger trusted a client-suppliable `role` in signup metadata, so anyone
  calling the Auth API directly could request `role: "student"` and get an
  active student account with no enrollment record. New rule: every
  self-service signup (Google or password) always lands `teacher` + `pending`,
  no exceptions; only the enrollment flow (service-role, admin-gated) may
  promote a profile to an active student

## 5. Enable admin email notifications (optional but recommended)

Create a free account at https://resend.com, generate an API key, and set
`RESEND_API_KEY` in `.env.local`. Without it, the app just logs a warning and
skips sending — nothing breaks. The default `RESEND_FROM_EMAIL`
(`onboarding@resend.dev`) works immediately with no domain setup, but only
delivers to email addresses verified on your Resend account; verify your own
domain there for real delivery to any admin's inbox.

## 6. Bootstrap the first admin

There's a chicken-and-egg problem: new staff start `pending`, and only an
`admin` can approve anyone. To create the first admin, sign in once via
`/login/staff` (you'll land on the "Awaiting Approval" page — that's
expected), then in the SQL Editor run:

```sql
update public.profiles set role = 'admin', status = 'active'
where email = 'you@yourschool.org';
```

Every admin account after that can be approved or promoted from
`/admin/users`.

## What's wired up so far

- **Staff auth** (`/login/staff`) — Google, or email + password. Either way
  lands `pending` until an admin approves them from `/admin/users` (role
  picker, suspend/reinstate). New pending sign-ups email every active admin
  (via Resend) with a link straight to the approval page - if they're signed
  out, the login flow carries them through to that exact page afterward.
- **Student auth** (`/login/student`) — registration number + password,
  checked against an internal email derived from the reg number.
- **Enrollment** (`/admin/students/enroll`) — creates a real Supabase Auth
  account + a `students` row, and shows the admin a one-time temporary
  password to hand to the student.
- **Student directory** (`/admin/students`) and the **student dashboard /
  personal details** pages all read real data now.
- Middleware (`middleware.ts`) refreshes the session on every request and
  keeps each role (plus pending/suspended status) confined to where it
  belongs.

## What's not wired up yet

Assignments, class notes, results, and fees/invoices are still empty
placeholders reading from `lib/data/*.ts` - those need their own tables
(bigger lift than students: assignments involve teacher+submission
relationships, fees involve the whole invoices/finance side). See the
repo-root README for the full data contract.

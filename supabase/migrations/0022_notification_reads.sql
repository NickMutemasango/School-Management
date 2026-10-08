-- Notifications stay live-computed (lib/notifications/notification-summary.ts
-- recomputes "what needs attention" from the underlying tables on every
-- request, rather than storing notification rows) - this migration only
-- adds the read-state layer that was missing, so a dismissed item can stay
-- dismissed instead of reappearing every render.
--
-- notification_key is the stable id the summary already assigns each live
-- item (a profile id, a class_teacher_subjects id, a subject_results id, or
-- a synthetic string like "classes-without-teacher") - there's nothing to
-- join against, so it's stored as plain text rather than a foreign key.
--
-- This is deliberately the one table in the app with a client-side insert
-- policy: "mark this notification read for myself" has no meaningful
-- ownership check beyond "it's my own user_id", unlike every other table's
-- writes which go through a service-role action.

create table public.notification_reads (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  notification_key text not null,
  read_at timestamptz not null default now(),
  unique (user_id, notification_key)
);

alter table public.notification_reads enable row level security;

create policy "notification_reads_select_own"
  on public.notification_reads for select
  using (user_id = auth.uid());

create policy "notification_reads_insert_own"
  on public.notification_reads for insert
  with check (user_id = auth.uid() and school_id = public.current_user_school_id());

create index notification_reads_user_id_idx on public.notification_reads (user_id);

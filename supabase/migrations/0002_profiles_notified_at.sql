-- Tracks whether the "new pending staff account" email has already gone out
-- for a given profile, so a pending user signing in again (still awaiting
-- approval) doesn't re-trigger the notification every time.
alter table public.profiles add column notified_at timestamptz;

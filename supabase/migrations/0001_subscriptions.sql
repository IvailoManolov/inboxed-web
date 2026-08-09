-- Inboxed subscriptions table. Run this in the Supabase SQL editor (or via the
-- Supabase CLI). One row per user; NO email content is ever stored here.

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   text,
  status                 text not null default 'inactive',
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

-- Defense in depth: the app writes with the service-role key (which bypasses
-- RLS), but we still lock the table down so a leaked anon key can't read or
-- write other users' rows. A user may read only their own row; no client-side
-- writes at all.
alter table public.subscriptions enable row level security;

drop policy if exists "own subscription is readable" on public.subscriptions;
create policy "own subscription is readable"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

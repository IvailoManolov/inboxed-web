-- Contact / "talk to us" inquiries captured from the marketing site.
-- Writes happen only via the server route using the service-role key, so RLS
-- is enabled with no public policies (the anon key can't read or write it).
create table if not exists public.contact_inquiries (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  message    text,
  source     text not null default 'contact_form',
  ip_hash    text,
  created_at timestamptz not null default now()
);

-- Rate-limit lookups by client (hashed IP) and recency.
create index if not exists contact_inquiries_ip_created_idx
  on public.contact_inquiries (ip_hash, created_at desc);

alter table public.contact_inquiries enable row level security;

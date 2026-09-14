-- Beta tester signups from the marketing landing page ("Start free" ->
-- /claim-your-link). Emails collected here are for outreach only — no
-- public read access, RLS allows insert-only from anon/authenticated.

create table beta_testers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  handle      text,
  source      text not null default 'landing',
  created_at  timestamptz not null default now()
);

create unique index beta_testers_email_key on beta_testers (lower(email));

alter table beta_testers enable row level security;

create policy "anyone can join the beta list" on beta_testers for insert
  to anon, authenticated
  with check (true);

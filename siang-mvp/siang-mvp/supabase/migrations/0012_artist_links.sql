-- Linktree-style links on an artist's page: any number of labelled URLs
-- ("Shop", "Portfolio", "YouTube"…) the artist orders themselves in the
-- Studio. artist_contacts stays for the four fixed contact kinds.

create table artist_links (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references artists(id) on delete cascade,
  label       text not null check (char_length(label) between 1 and 60),
  -- Only web links: the public page renders these as <a href>, so a
  -- javascript: or data: URL must never get in.
  url         text not null check (url ~* '^https?://' and char_length(url) <= 500),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index artist_links_artist_id_idx on artist_links (artist_id, sort_order);

alter table artist_links enable row level security;

create policy "public read artist_links" on artist_links for select using (true);

create policy "artist manages own links" on artist_links for all
  to authenticated
  using (artist_id in (select id from artists where user_id = (select auth.uid())))
  with check (artist_id in (select id from artists where user_id = (select auth.uid())));

grant select on table public.artist_links to anon, authenticated;
grant insert, update, delete on table public.artist_links to authenticated;

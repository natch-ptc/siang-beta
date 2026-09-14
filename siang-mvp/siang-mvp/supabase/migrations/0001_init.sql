-- Pocket (siang) — initial schema
-- Entities derived from the original single-file mockup (index.html):
-- artists, artworks (with descriptive blocks), exhibitions, and the
-- many-to-many relationship between works and the shows they hang in.

create extension if not exists "pgcrypto";

-- ---------- artists ----------
create table artists (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null, -- null until the artist claims/signs in
  slug          text unique not null,
  name          text not null,
  discipline    text,
  based         text,
  country       text,
  lat           numeric,
  lng           numeric,
  bio           text,
  avatar_url    text,
  card_bg       text,   -- css gradient/hex used to draw the card
  card_ink      text,
  card_tint     text,
  joined_at     timestamptz default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table artist_contacts (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references artists(id) on delete cascade,
  kind        text not null check (kind in ('ig','line','email','web')),
  value       text not null,
  unique (artist_id, kind)
);

-- ---------- artworks ----------
create table artworks (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid not null references artists(id) on delete cascade,
  slug           text not null,
  code           text unique not null,          -- 6-digit scan code, printed under the QR
  title          text not null,
  duration_sec   int,
  description    text,
  audio_url      text,                          -- Supabase Storage object path
  cover_url      text,
  listen_count   bigint not null default 0,     -- cached; kept accurate by increment_listen_count()
  side           smallint default 0,            -- which face of the card the work belongs to (0/1)
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (artist_id, slug)
);

create index artworks_artist_id_idx on artworks(artist_id);
create index artworks_code_idx on artworks(code);

create table artwork_blocks (
  id           uuid primary key default gen_random_uuid(),
  artwork_id   uuid not null references artworks(id) on delete cascade,
  type         text not null check (type in ('image','video','text','sound')),
  media_url    text,
  caption      text,
  body         text,          -- used when type = 'text'
  sort_order   int not null default 0
);

create index artwork_blocks_artwork_id_idx on artwork_blocks(artwork_id);

-- ---------- exhibitions ----------
create table exhibitions (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid references artists(id) on delete set null, -- organizing/primary artist, if any
  title        text not null,
  kind         text not null check (kind in ('solo','group')),
  year         int,
  venue        text,
  lat          numeric,
  lng          numeric,
  created_at   timestamptz not null default now()
);

create table exhibition_artworks (
  exhibition_id  uuid not null references exhibitions(id) on delete cascade,
  artwork_id     uuid not null references artworks(id) on delete cascade,
  primary key (exhibition_id, artwork_id)
);

-- ---------- plays (listen log; artworks.listen_count is the fast-read cache) ----------
create table plays (
  id           uuid primary key default gen_random_uuid(),
  artwork_id   uuid not null references artworks(id) on delete cascade,
  listener_id  uuid references auth.users(id) on delete set null,
  played_at    timestamptz not null default now()
);

create index plays_artwork_id_idx on plays(artwork_id);
create index plays_played_at_idx on plays(played_at);

-- atomically log a play and bump the cached counter
create or replace function increment_listen_count(p_artwork_id uuid, p_listener_id uuid default null)
returns void
language plpgsql
security definer
as $$
begin
  insert into plays (artwork_id, listener_id) values (p_artwork_id, p_listener_id);
  update artworks set listen_count = listen_count + 1 where id = p_artwork_id;
end;
$$;

-- ---------- scan codes: a QR can point at a work, an artist, or a show ----------
create table scan_codes (
  code          text primary key,
  target_type   text not null check (target_type in ('artwork','artist','exhibition')),
  target_id     uuid not null,
  created_at    timestamptz not null default now()
);

-- ---------- updated_at housekeeping ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artists_set_updated_at before update on artists
  for each row execute function set_updated_at();
create trigger artworks_set_updated_at before update on artworks
  for each row execute function set_updated_at();

-- ---------- row level security ----------
alter table artists enable row level security;
alter table artist_contacts enable row level security;
alter table artworks enable row level security;
alter table artwork_blocks enable row level security;
alter table exhibitions enable row level security;
alter table exhibition_artworks enable row level security;
alter table plays enable row level security;
alter table scan_codes enable row level security;

-- public read on everything a viewer needs to browse cards and play works
create policy "public read artists" on artists for select using (true);
create policy "public read artist_contacts" on artist_contacts for select using (true);
create policy "public read artworks" on artworks for select using (true);
create policy "public read artwork_blocks" on artwork_blocks for select using (true);
create policy "public read exhibitions" on exhibitions for select using (true);
create policy "public read exhibition_artworks" on exhibition_artworks for select using (true);
create policy "public read scan_codes" on scan_codes for select using (true);

-- artists manage only their own rows (Studio / Composer)
create policy "artist manages own row" on artists for update
  using (auth.uid() = user_id);

create policy "artist manages own contacts" on artist_contacts for all
  using (artist_id in (select id from artists where user_id = auth.uid()))
  with check (artist_id in (select id from artists where user_id = auth.uid()));

create policy "artist manages own artworks" on artworks for all
  using (artist_id in (select id from artists where user_id = auth.uid()))
  with check (artist_id in (select id from artists where user_id = auth.uid()));

create policy "artist manages own artwork_blocks" on artwork_blocks for all
  using (artwork_id in (
    select aw.id from artworks aw join artists a on a.id = aw.artist_id where a.user_id = auth.uid()
  ))
  with check (artwork_id in (
    select aw.id from artworks aw join artists a on a.id = aw.artist_id where a.user_id = auth.uid()
  ));

create policy "artist manages own exhibitions" on exhibitions for all
  using (artist_id in (select id from artists where user_id = auth.uid()))
  with check (artist_id in (select id from artists where user_id = auth.uid()));

-- plays: anyone can log a play (anonymous listens allowed); nobody reads other people's rows directly
create policy "anyone logs a play" on plays for insert with check (true);
create policy "artist reads own plays" on plays for select
  using (artwork_id in (
    select aw.id from artworks aw join artists a on a.id = aw.artist_id where a.user_id = auth.uid()
  ));

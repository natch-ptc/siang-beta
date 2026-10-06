-- Siang beta launch checklist (Oct 2026): the fields and states the two beta
-- flows still lacked. Additive and nullable (or defaulted), like 0015, so
-- existing rows and code deployed before this migration keep working.

-- ---------- artists ----------
alter table artists add column statement            text check (char_length(statement) <= 4000);
alter table artists add column shop_url             text check (shop_url ~* '^https?://' and char_length(shop_url) <= 500);
-- "I own or have the rights to what I upload", ticked when the profile is made.
alter table artists add column rights_confirmed_at  timestamptz;
-- A handle can be changed once. The old one keeps leading to the page.
alter table artists add column previous_slug        text;
alter table artists add column slug_changed_at      timestamptz;
alter table artists add column view_count           bigint not null default 0;
-- Set by the Siang team to take a whole profile off the site (see the end of this file).
alter table artists add column hidden               boolean not null default false;

create index artists_previous_slug_idx on artists (previous_slug) where previous_slug is not null;

-- ---------- works ----------
alter table artworks add column title_en      text check (char_length(title_en) <= 200);
-- Size as the artist writes it ("40 x 60 cm", "variable"). height_cm and
-- width_cm from 0015 stay as optional numbers, for the human-figure drawing.
alter table artworks add column size_text     text check (char_length(size_text) <= 120);
alter table artworks add column materials     text check (char_length(materials) <= 300);
alter table artworks add column edition       text check (char_length(edition) <= 120);
alter table artworks add column credits       text check (char_length(credits) <= 500);
alter table artworks add column price         text check (char_length(price) <= 80); -- "12,000 THB" or "Price on request"
alter table artworks add column availability  text check (availability in ('available', 'sold', 'not_for_sale'));
alter table artworks add column location_now  text check (char_length(location_now) <= 160);
alter table artworks add column view_count    bigint not null default 0;
-- 'taken_down' is the artist's own choice and can be undone; 'removed' is set
-- by the Siang team. Either way the work leaves every list, and its link, QR
-- and code open a simple page with its title and a link to the artist, so
-- nothing that was ever printed shows an error.
alter table artworks add column status        text not null default 'published'
  check (status in ('published', 'taken_down', 'removed'));

-- ---------- page views (basic numbers) ----------
-- The browser calls this once per visitor, page and day; the owner's own
-- visits are not sent. Only the counters are touched, nothing is logged.
create or replace function count_view(p_kind text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'artist' then
    update artists set view_count = view_count + 1 where id = p_id;
  elsif p_kind = 'artwork' then
    update artworks set view_count = view_count + 1 where id = p_id;
  end if;
end;
$$;

grant execute on function count_view(text, uuid) to anon, authenticated;

-- ---------- how the team removes something ----------
-- There is no admin screen yet. After reading a report (table `reports`),
-- run one of these in the Supabase SQL editor:
--
--   update artworks set status = 'removed' where code = '123456';          -- one work
--   update artists  set hidden = true      where slug = 'the-handle';      -- a whole profile
--   update reports  set status = 'removed' where id = '<report id>';       -- mark it handled
--
-- An artist cannot put a 'removed' work back: the Studio only switches
-- between 'published' and 'taken_down'.
create or replace function keep_removed_works_removed()
returns trigger language plpgsql as $$
begin
  if old.status = 'removed' and new.status <> 'removed' and auth.uid() is not null then
    raise exception 'This work was removed by the Siang team.';
  end if;
  return new;
end;
$$;

create trigger artworks_keep_removed before update of status on artworks
  for each row execute function keep_removed_works_removed();

-- The same for a hidden profile: only the team can show it again.
create or replace function keep_hidden_artists_hidden()
returns trigger language plpgsql as $$
begin
  if old.hidden and not new.hidden and auth.uid() is not null then
    raise exception 'This profile was hidden by the Siang team.';
  end if;
  return new;
end;
$$;

create trigger artists_keep_hidden before update of hidden on artists
  for each row execute function keep_hidden_artists_hidden();

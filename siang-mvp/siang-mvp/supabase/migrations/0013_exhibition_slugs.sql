-- Exhibitions get their own address, siang.co/<artist>/shows/<slug>.
-- Before this, share links were built from the title in the browser, so a
-- Thai title became "show-1", "show-2"… by position, and the link pointed
-- at a different show as soon as another one was added.

-- The default keeps inserts from older app code working until it's deployed.
alter table exhibitions add column slug text default ('show-' || substr(gen_random_uuid()::text, 1, 8));

-- Backfill: the English part of the title ("น้ำนิ่ง (Still Water, Turning)"
-- -> "still-water-turning"), or "show" when there isn't one…
update exhibitions
set slug = coalesce(nullif(trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), ''), 'show');

-- …plus a short id suffix wherever that would clash within one artist.
update exhibitions e
set slug = e.slug || '-' || substr(e.id::text, 1, 4)
where exists (
  select 1 from exhibitions o
  where o.artist_id = e.artist_id and o.slug = e.slug and o.id <> e.id
);

alter table exhibitions alter column slug set not null;
alter table exhibitions add constraint exhibitions_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60);
alter table exhibitions add constraint exhibitions_artist_slug_key unique (artist_id, slug);

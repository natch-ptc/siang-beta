-- Three more artists from the original mockup's "AVAILABLE" pool — not in
-- anyone's Pocket by default, discoverable only by scanning their QR code.
begin;

insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values
  (gen_random_uuid(), 'lek-thammawong', 'Lek Thammawong', 'Woodblock print', 'Lampang', 'Thailand', 18.2888, 99.4909,
   'Cuts woodblocks from reclaimed teak in Lampang and prints every sheet by hand.',
   '#C98C4E', '#2A1606', '#B87A3D', '2025-09-01T00:00:00Z'),
  (gen_random_uuid(), 'ines-duarte', 'Inês Duarte', 'Light installation', 'Porto', 'Portugal', 41.1579, -8.6291,
   'Builds slow light installations in Porto, tuned to the hum of the rooms they sit in.',
   'radial-gradient(120% 90% at 50% 22%,#3A3A3F,#121214)', '#F0EDE4', '#33333A', '2026-02-01T00:00:00Z'),
  (gen_random_uuid(), 'somchai-ratana', 'Somchai Ratana', 'Bronze bells', 'Ayutthaya', 'Thailand', 14.3532, 100.5689,
   'Casts bronze bells at a family foundry in Ayutthaya, and records the first strike of each one.',
   'linear-gradient(160deg,#D9C08A,#A8894C)', '#241A06', '#BFA067', '2024-12-01T00:00:00Z');

insert into artist_contacts (artist_id, kind, value)
  select id, 'ig', 'lek.woodcut' from artists where slug = 'lek-thammawong'
  union all select id, 'line', 'lekprint' from artists where slug = 'lek-thammawong'
  union all select id, 'ig', 'ines.lume' from artists where slug = 'ines-duarte'
  union all select id, 'web', 'inesduarte.pt' from artists where slug = 'ines-duarte'
  union all select id, 'ig', 'somchai.bells' from artists where slug = 'somchai-ratana'
  union all select id, 'line', 'ratanafoundry' from artists where slug = 'somchai-ratana';

insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng)
  select gen_random_uuid(), id, 'Cut Against Grain', 'solo', 2025, 'Lampang Art Space', 18.2888, 99.4909 from artists where slug = 'lek-thammawong'
  union all select gen_random_uuid(), id, 'Relief', 'group', 2024, 'CMU Art Center, Chiang Mai', 18.7900, 98.9750 from artists where slug = 'lek-thammawong'
  union all select gen_random_uuid(), id, 'Slow Filament', 'solo', 2026, 'Galeria Municipal do Porto', 41.1620, -8.6210 from artists where slug = 'ines-duarte'
  union all select gen_random_uuid(), id, 'Low Voltage', 'group', 2025, 'Serralves, Porto', 41.1590, -8.6590 from artists where slug = 'ines-duarte'
  union all select gen_random_uuid(), id, 'Nine Strikes', 'solo', 2024, 'Ayutthaya Historical Park', 14.3560, 100.5590 from artists where slug = 'somchai-ratana'
  union all select gen_random_uuid(), id, 'Cast', 'group', 2026, 'Chao Phraya Foundry, Ayutthaya', 14.3480, 100.5770 from artists where slug = 'somchai-ratana';

-- works, each linked to the artist's first (solo) exhibition above
with lek as (select id from artists where slug = 'lek-thammawong'),
     lek_show as (select id from exhibitions where artist_id = (select id from lek) order by year desc limit 1),
     ines as (select id from artists where slug = 'ines-duarte'),
     ines_show as (select id from exhibitions where artist_id = (select id from ines) order by year desc limit 1),
     somchai as (select id from artists where slug = 'somchai-ratana'),
     somchai_show as (select id from exhibitions where artist_id = (select id from somchai) order by year desc limit 1),
     new_works as (
       insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order)
       values
         (gen_random_uuid(), (select id from lek), 'cut-against-grain', (100000 + floor(random()*899999))::text, 'Cut Against Grain', 350, 'A teak block cut across the grain, which the wood resists. The struggle is audible in the mallet.', 19430, 0),
         (gen_random_uuid(), (select id from lek), 'teak', (100000 + floor(random()*899999))::text, 'ไม้สัก (Teak)', 242, 'Offcuts from a house being taken apart in Lampang, printed at their full size.', 14870, 1),
         (gen_random_uuid(), (select id from ines), 'slow-filament', (100000 + floor(random()*899999))::text, 'Slow Filament', 840, 'A single bulb brought from dark to full over fourteen minutes. The hum rises with it.', 7640, 0),
         (gen_random_uuid(), (select id from ines), 'switch-room', (100000 + floor(random()*899999))::text, 'Switch Room', 500, 'Recorded inside a disused electrical room. Everything in it still carries a current.', 5320, 1),
         (gen_random_uuid(), (select id from somchai), 'nine-strikes', (100000 + floor(random()*899999))::text, 'Nine Strikes', 442, 'Nine bells cast in one pour, struck in order and left to overlap.', 52140, 0),
         (gen_random_uuid(), (select id from somchai), 'morning-bell', (100000 + floor(random()*899999))::text, 'ระฆังเช้า (Morning Bell)', 250, 'The morning bell at a temple near Somchai''s foundry, recorded from the tower.', 36980, 1)
       returning id, artist_id, sort_order
     )
insert into exhibition_artworks (exhibition_id, artwork_id)
select
  case
    when nw.artist_id = (select id from lek) then (select id from lek_show)
    when nw.artist_id = (select id from ines) then (select id from ines_show)
    else (select id from somchai_show)
  end,
  nw.id
from new_works nw
where nw.sort_order = 0;

commit;

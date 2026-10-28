-- Six demo artists and their thirteen works for the Siang booth, at the exact
-- addresses printed on the QR codes: siang.co/<handle> and siang.co/<handle>/work-<id>.
-- Needs 0015_v3_fields.sql, 0016_beta_checklist.sql and 0017_siang_official.sql.
--
-- Each artist is owned by no account, like the Siang page. A work's six-digit
-- code is the last six digits of its id, so it is fixed and never collides.
-- The pictures are in web/public/art/demo/, the sounds in web/public/audio/demo/
-- and web/public/audio/examples/ (credits in CREDITS.md beside each). The titles
-- are descriptive names chosen by the team, not supplied by the artists; rename with:
--   update artworks set title = 'The real title', title_en = 'The real title' where slug = 'work-1791608904006';
--
-- Safe to run again: it rebuilds these six pages each time. Do NOT run 0017
-- again after this, it deletes every artist that no account owns.

begin;

delete from exhibitions where artist_id in (select id from artists where user_id is null and slug in ('h.philippe', 'banksy', 'wb', 'tatsuya', 'repponen', 'kuroro.22222'));
delete from artists where user_id is null and slug in ('h.philippe', 'banksy', 'wb', 'tatsuya', 'repponen', 'kuroro.22222');

-- Philippe Halsman
with a as (
  insert into artists (slug, name, discipline, based, country, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values ('h.philippe', 'Philippe Halsman', 'Photo', null, null, 'Philippe Halsman was at one point considered the best photo-portraitist in France', 'Modern, Black-and-White Photography, Staged Photography', '/art/demo/h-philippe-avatar.jpg', '#000000', '#ffffff', 'Asia/Bangkok')
  returning id
)
insert into artworks (artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at, availability, location_now)
select a.id, w.slug, w.code, w.title, w.title, '', w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - interval '1 day' - w.sort_order * interval '1 minute', 'not_for_sale', ''
from a, (values
  ('work-1791608904006', '904006', 'The Versatile Jean Cocteau', '/art/demo/h-philippe-art-1.jpg', '/audio/examples/pencil.mp3', 82, 0),
  ('work-1791991947874', '947874', 'Salvador Dalí', '/art/demo/h-philippe-art-2.jpg', '/audio/demo/h-philippe-2.mp3', 18, 1)
) as w (slug, code, title, cover_url, audio_url, duration_sec, sort_order);

-- Banksy
with a as (
  insert into artists (slug, name, discipline, based, country, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values ('banksy', 'Banksy', 'Other', null, null, 'Banksy is a pseudonymous England-based street artist, political activist, and film director whose real name and identity remain unconfirmed and the subject.', '', '/art/demo/banksy-avatar.jpg', '#000000', '#ffffff', 'Asia/Bangkok')
  returning id
)
insert into artworks (artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at, availability, location_now)
select a.id, w.slug, w.code, w.title, w.title, '', w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - interval '1 day' - w.sort_order * interval '1 minute', 'not_for_sale', ''
from a, (values
  ('work-1792571520056', '520056', 'Love Is in the Air (Flower Thrower)', '/art/demo/banksy-art-1.jpg', '/audio/demo/banksy-1.mp3', 29, 0),
  ('work-1793161085510', '085510', 'Valentine''s Day Mascara', '/art/demo/banksy-art-2.jpg', '/audio/demo/banksy-2.mp3', 6, 1)
) as w (slug, code, title, cover_url, audio_url, duration_sec, sort_order);

-- werner_bronkhorst
with a as (
  insert into artists (slug, name, discipline, based, country, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values ('wb', 'werner_bronkhorst', 'Painting', null, null, 'The whole world is a canvas, we''re just walking in it.', '', '/art/demo/wb-avatar.jpg', '#000000', '#ffffff', 'Asia/Bangkok')
  returning id
)
insert into artworks (artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at, availability, location_now)
select a.id, w.slug, w.code, w.title, w.title, '', w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - interval '1 day' - w.sort_order * interval '1 minute', 'not_for_sale', ''
from a, (values
  ('work-1793896009259', '009259', 'Blue Slope', '/art/demo/wb-art-1.jpg', '/audio/demo/wb-1.mp3', 40, 0),
  ('work-1794046214732', '214732', 'Pitch', '/art/demo/wb-art-2.jpg', '/audio/demo/wb-2.mp3', 14, 1)
) as w (slug, code, title, cover_url, audio_url, duration_sec, sort_order);

-- Tatsuya Tanaka
with a as (
  insert into artists (slug, name, discipline, based, country, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values ('tatsuya', 'Tatsuya Tanaka', 'Other', null, null, 'Creating daily miniature art for 15 years.', '', '/art/demo/tatsuya-avatar.jpg', '#000000', '#ffffff', 'Asia/Bangkok')
  returning id
)
insert into artworks (artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at, availability, location_now)
select a.id, w.slug, w.code, w.title, w.title, '', w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - interval '1 day' - w.sort_order * interval '1 minute', 'not_for_sale', ''
from a, (values
  ('work-1794325964692', '964692', 'Crisp Dunes', '/art/demo/tatsuya-art-1.jpg', '/audio/examples/wind.mp3', 68, 0),
  ('work-1795011316443', '316443', 'Comb Forest', '/art/demo/tatsuya-art-2.jpg', '/audio/demo/tatsuya-2.mp3', 45, 1),
  ('work-1795718629916', '629916', 'Hair Clip Crew', '/art/demo/tatsuya-art-3.jpg', '/audio/demo/tatsuya-3.mp3', 30, 2),
  ('work-1796356230614', '230614', 'Notebook Race', '/art/demo/tatsuya-art-4.jpg', '/audio/examples/paper.mp3', 78, 3)
) as w (slug, code, title, cover_url, audio_url, duration_sec, sort_order);

-- Anton Repponen
with a as (
  insert into artists (slug, name, discipline, based, country, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values ('repponen', 'Anton Repponen', 'Photo', 'New York', 'United States', 'Designer and photographer based in Brooklyn, NY.', '', '/art/demo/repponen-avatar.jpg', '#000000', '#ffffff', 'Asia/Bangkok')
  returning id
)
insert into artworks (artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at, availability, location_now)
select a.id, w.slug, w.code, w.title, w.title, '', w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - interval '1 day' - w.sort_order * interval '1 minute', 'not_for_sale', ''
from a, (values
  ('work-1796847862478', '862478', 'Street Stretch I', '/art/demo/repponen-art-1.jpg', '/audio/demo/repponen-1.mp3', 45, 0),
  ('work-1797729003243', '003243', 'Street Stretch II', '/art/demo/repponen-art-2.jpg', '/audio/demo/repponen-2.mp3', 45, 1)
) as w (slug, code, title, cover_url, audio_url, duration_sec, sort_order);

-- Kuroro
with a as (
  insert into artists (slug, name, discipline, based, country, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values ('kuroro.22222', 'Kuroro', 'Other', null, null, '喜歡融入人類但有時融到看不到
所以常做出難以忽視的事', '', '/art/demo/kuroro-avatar.jpg', '#000000', '#ffffff', 'Asia/Bangkok')
  returning id
)
insert into artworks (artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at, availability, location_now)
select a.id, w.slug, w.code, w.title, w.title, '', w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - interval '1 day' - w.sort_order * interval '1 minute', 'not_for_sale', ''
from a, (values
  ('work-1798383794318', '794318', 'Kuroro on the Line', '/art/demo/kuroro-art-1.jpg', '/audio/demo/kuroro-1.mp3', 9, 0)
) as w (slug, code, title, cover_url, audio_url, duration_sec, sort_order);

commit;

-- Real open-access art (The Metropolitan Museum of Art, public domain) for the
-- three artists from seed_available.sql, who still showed flat colours and
-- generated line-art. Files live in web/public/art.

begin;

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/durer-woodblock-samson.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/durer-woodblock-samson.jpg'
where slug = 'lek-thammawong';

update artworks set cover_url = case slug
  when 'cut-against-grain' then '/art/durer-woodblock-samson.jpg'
  when 'teak' then '/art/shunman-letter-box-plum.jpg'
end
where artist_id = (select id from artists where slug = 'lek-thammawong')
  and slug in ('cut-against-grain', 'teak');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/latour-penitent-magdalen.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/latour-penitent-magdalen.jpg'
where slug = 'ines-duarte';

update artworks set cover_url = case slug
  when 'slow-filament' then '/art/latour-penitent-magdalen.jpg'
  when 'switch-room' then '/art/rembrandt-student-candlelight.jpg'
end
where artist_id = (select id from artists where slug = 'ines-duarte')
  and slug in ('slow-filament', 'switch-room');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/java-temple-bell.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/java-temple-bell.jpg'
where slug = 'somchai-ratana';

update artworks set cover_url = case slug
  when 'nine-strikes' then '/art/ban-chiang-large-bell.jpg'
  when 'morning-bell' then '/art/java-temple-bell.jpg'
end
where artist_id = (select id from artists where slug = 'somchai-ratana')
  and slug in ('nine-strikes', 'morning-bell');

commit;

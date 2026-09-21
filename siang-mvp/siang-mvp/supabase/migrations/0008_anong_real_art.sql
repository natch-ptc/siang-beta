-- Real open-access art for Anong Vetchakul (National Gallery of Art, Index of
-- American Design, public domain). Files live in web/public/art.

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/pa-german-bowl-boehmer.jpg'') center/cover no-repeat',
  card_ink = '#FCE7F1',
  avatar_url = '/art/pa-german-bowl-boehmer.jpg'
where slug = 'anong-vetchakul';

update artworks set cover_url = case slug
  when 'still-water'   then '/art/pottery-flat-bowl-johnston.jpg'
  when 'clay-and-fire' then '/art/pottery-jug-roberts.jpg'
  when 'sixth-bowl'    then '/art/crock-amantea.jpg'
  when 'kiln-wind'     then '/art/pa-german-bowl-boehmer.jpg'
end
where artist_id = (select id from artists where slug = 'anong-vetchakul')
  and slug in ('still-water', 'clay-and-fire', 'sixth-bowl', 'kiln-wind');

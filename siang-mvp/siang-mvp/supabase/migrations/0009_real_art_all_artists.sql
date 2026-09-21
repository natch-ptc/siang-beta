-- Real open-access art (National Gallery of Art) for the remaining seeded artists.
-- Files live in web/public/art.

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/manet-railway.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/manet-railway.jpg'
where slug = 'kanit-prasong';

update artworks set cover_url = case slug
  when 'room-tone-no7' then '/art/monet-interior-after-dinner.jpg'
  when 'market-4am' then '/art/negre-marche.jpg'
  when 'rain-on-zinc' then '/art/henri-volendam.jpg'
  when 'empty-platform' then '/art/baldus-toulon-gare.jpg'
end
where artist_id = (select id from artists where slug = 'kanit-prasong')
  and slug in ('room-tone-no7', 'market-4am', 'rain-on-zinc', 'empty-platform');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/dragon-weather-vane-jensen.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/dragon-weather-vane-jensen.jpg'
where slug = 'field-and-static';

update artworks set cover_url = case slug
  when 'monsoon-index' then '/art/weather-vane-eiseman.jpg'
  when 'brass-in-the-rain' then '/art/brass-bell-miller.jpg'
  when 'tide-machine' then '/art/ships-bell-towner.jpg'
  when 'low-season' then '/art/weather-vane-strehlau.jpg'
end
where artist_id = (select id from artists where slug = 'field-and-static')
  and slug in ('monsoon-index', 'brass-in-the-rain', 'tide-machine', 'low-season');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/cezanne-armchair-cushion.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/cezanne-armchair-cushion.jpg'
where slug = 'prawit-chan';

update artworks set cover_url = case slug
  when 'hand-study' then '/art/sargent-hands.jpg'
  when 'empty-chair' then '/art/wilkie-chair-leg.jpg'
  when 'late-light' then '/art/cotman-church-chair.jpg'
  when 'breath' then '/art/guarana-hands-prayer.jpg'
end
where artist_id = (select id from artists where slug = 'prawit-chan')
  and slug in ('hand-study', 'empty-chair', 'late-light', 'breath');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/daubigny-washerwomen.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/daubigny-washerwomen.jpg'
where slug = 'mai-sirichai';

update artworks set cover_url = case slug
  when 'sunprint-diary' then '/art/havell-blue-crane.jpg'
  when 'nan-river' then '/art/corot-river-view.jpg'
  when 'linen-drying' then '/art/whistler-clothes-exchange.jpg'
  when 'leaf-shadow' then '/art/aldegrever-foliage.jpg'
end
where artist_id = (select id from artists where slug = 'mai-sirichai')
  and slug in ('sunprint-diary', 'nan-river', 'linen-drying', 'leaf-shadow');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/coverlet-cornelius.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/coverlet-cornelius.jpg'
where slug = 'ruth-aldana';

update artworks set cover_url = case slug
  when 'warp-weft-warp' then '/art/coverlet-loper.jpg'
  when 'loom-at-dusk' then '/art/coverlet-wool-brown.jpg'
  when 'indigo-count' then '/art/coverlet-henderer.jpg'
  when 'thread-memory' then '/art/coverlet-lefevere.jpg'
end
where artist_id = (select id from artists where slug = 'ruth-aldana')
  and slug in ('warp-weft-warp', 'loom-at-dusk', 'indigo-count', 'thread-memory');

update artists set
  card_bg = 'linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url(''/art/flask-delasser.jpg'') center/cover no-repeat',
  card_ink = '#F6F1EA',
  avatar_url = '/art/flask-delasser.jpg'
where slug = 'nima-farhadi';

update artworks set cover_url = case slug
  when 'three-breaths' then '/art/gemel-bottle-goldberg.jpg'
  when 'furnace-song' then '/art/ring-bottle-delasser.jpg'
  when 'cooling-rack' then '/art/flask-fumagalli.jpg'
  when 'glass-falling' then '/art/ring-bottle-capelli.jpg'
end
where artist_id = (select id from artists where slug = 'nima-farhadi')
  and slug in ('three-breaths', 'furnace-song', 'cooling-rack', 'glass-falling');


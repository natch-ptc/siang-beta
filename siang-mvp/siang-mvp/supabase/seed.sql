-- Seed data for the Pocket artists. Originally generated from mock data;
-- now maintained by hand alongside the migrations.
begin;
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('6e670d45-d892-4679-a22e-a6d4733617b5', 'anong-vetchakul', 'Anong Vetchakul', null, 'Chiang Mai', 'Thailand', 18.7883, 98.9853, 'Throws thin celadon in a small studio near the Ping river. Every work is recorded inside the kiln while it fires.', 'linear-gradient(168deg,#C8497F,#B63878)', '#FCE7F1', '#B63878', 'Feb 2025 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('6e670d45-d892-4679-a22e-a6d4733617b5', 'ig', 'anong.clay');
insert into artist_contacts (artist_id, kind, value) values ('6e670d45-d892-4679-a22e-a6d4733617b5', 'email', 'studio@anongvetchakul.com');
insert into artist_contacts (artist_id, kind, value) values ('6e670d45-d892-4679-a22e-a6d4733617b5', 'web', 'anongvetchakul.com');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('374a1d9a-6cc1-48ed-b470-e6defea4ce13', '6e670d45-d892-4679-a22e-a6d4733617b5', 'น้ำนิ่ง (Still Water, Turning)', 'solo', 2025, 'Gallery Seescape, Chiang Mai', 18.7955, 98.9722);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('c33428b0-acdb-491d-9d38-46502b89749f', '6e670d45-d892-4679-a22e-a6d4733617b5', 'ดินเผา (Fired Earth)', 'group', 2024, 'MAIIAM Contemporary Art Museum', 18.7638, 99.0508);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('b2729bd2-f5c5-44a4-8b19-91bb0c3903e7', '6e670d45-d892-4679-a22e-a6d4733617b5', 'still-water', '982780', 'น้ำนิ่ง (Still Water)', 192, 'A shallow celadon basin, thrown thin enough that light passes through the rim. The recording is the kiln at hour eleven, when the glaze begins to move.', 24810, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('374a1d9a-6cc1-48ed-b470-e6defea4ce13', 'b2729bd2-f5c5-44a4-8b19-91bb0c3903e7');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('4ef03b11-d513-4c1b-9d60-34bd20068f98', '6e670d45-d892-4679-a22e-a6d4733617b5', 'clay-and-fire', '480585', 'ดินกับไฟ (Clay and Fire)', 288, 'Two vessels fired in the same load, one pulled early. What you hear is the cooling, forty minutes compressed into five.', 18240, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('374a1d9a-6cc1-48ed-b470-e6defea4ce13', '4ef03b11-d513-4c1b-9d60-34bd20068f98');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('f4ad2d21-3bfa-4a99-8993-9f1865e7796a', '6e670d45-d892-4679-a22e-a6d4733617b5', 'sixth-bowl', '322570', 'ถ้วยที่หก (Sixth Bowl)', 156, 'The sixth attempt at a form Anong had been circling for a year. She kept the crack and glazed over it.', 9615, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('c33428b0-acdb-491d-9d38-46502b89749f', 'f4ad2d21-3bfa-4a99-8993-9f1865e7796a');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('1014571d-8b12-4037-8d6c-0dd7d6bed77c', '6e670d45-d892-4679-a22e-a6d4733617b5', 'kiln-wind', '135742', 'ลมในเตา (Kiln Wind)', 364, 'Air moving through the chamber before the fire is lit. Nothing is being made yet, which is the point.', 7302, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('c33428b0-acdb-491d-9d38-46502b89749f', '1014571d-8b12-4037-8d6c-0dd7d6bed77c');
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('1817d108-3b8c-4058-95a7-9acf96e5f08f', 'kanit-prasong', 'Kanit Prasong', null, 'Bangkok', 'Thailand', 13.7563, 100.5018, 'Records rooms, markets and train platforms around Bangkok, usually in the hour before anyone arrives.', '#000000', '#E4E4E4', '#1B1B1B', 'Aug 2024 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('1817d108-3b8c-4058-95a7-9acf96e5f08f', 'ig', 'kanit.hears');
insert into artist_contacts (artist_id, kind, value) values ('1817d108-3b8c-4058-95a7-9acf96e5f08f', 'email', 'kanit@roomtone.studio');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('d74a02ff-1e2f-4072-ab07-75cae598a366', '1817d108-3b8c-4058-95a7-9acf96e5f08f', 'เสียงห้อง (Room Tone)', 'solo', 2024, 'Bangkok Art and Culture Centre', 13.7466, 100.5300);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('8f96090e-de36-4a86-b58a-a980e2c066a4', '1817d108-3b8c-4058-95a7-9acf96e5f08f', 'Night Transit', 'group', 2026, 'Warehouse 30, Charoenkrung', 13.7239, 100.5150);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('d270bc53-7583-4797-a2db-f89f9ad7bb19', '1817d108-3b8c-4058-95a7-9acf96e5f08f', 'room-tone-no7', '953994', 'Room Tone No.7', 1082, 'Eighteen minutes of an empty apartment in Ari, recorded the week before it was pulled down. Traffic arrives through a single open window.', 88420, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('d74a02ff-1e2f-4072-ab07-75cae598a366', 'd270bc53-7583-4797-a2db-f89f9ad7bb19');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('5fb17cea-50d7-4be6-9f14-e02d718d738d', '1817d108-3b8c-4058-95a7-9acf96e5f08f', 'market-4am', '130995', 'ตลาดตอนตีสี่ (Market, 4am)', 555, 'Khlong Toei at four in the morning, when the trucks arrive and nobody is speaking yet. Kanit walked one length of the market without stopping.', 64180, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('d74a02ff-1e2f-4072-ab07-75cae598a366', '5fb17cea-50d7-4be6-9f14-e02d718d738d');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('467a8c7c-dd8f-4c39-9965-9db2d9be619e', '1817d108-3b8c-4058-95a7-9acf96e5f08f', 'rain-on-zinc', '793908', 'ฝนบนหลังคาสังกะสี (Rain on Zinc)', 400, 'A zinc roof in the rainy season, from directly beneath. The pitch rises as the sheet warms.', 51930, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('8f96090e-de36-4a86-b58a-a980e2c066a4', '467a8c7c-dd8f-4c39-9965-9db2d9be619e');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('bc879456-3cda-4bcc-90e5-97579af232fc', '1817d108-3b8c-4058-95a7-9acf96e5f08f', 'empty-platform', '971614', 'Empty Platform', 688, 'Recorded at the end of the line after the last train. The station keeps humming long after the doors close.', 33470, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('8f96090e-de36-4a86-b58a-a980e2c066a4', 'bc879456-3cda-4bcc-90e5-97579af232fc');
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('8378a4a5-3254-4010-b3d9-263cde9636e9', 'field-and-static', 'Field & Static', null, 'Krabi', 'Thailand', 8.0863, 98.9063, 'A two-person studio in Krabi building brass instruments for the weather to play.', '#17392B', '#D6E4D8', '#1F5340', 'Jan 2026 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('8378a4a5-3254-4010-b3d9-263cde9636e9', 'ig', 'fieldandstatic');
insert into artist_contacts (artist_id, kind, value) values ('8378a4a5-3254-4010-b3d9-263cde9636e9', 'web', 'fieldandstatic.com');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('4335e9da-9160-4f1f-8c2d-ef03ecce2422', '8378a4a5-3254-4010-b3d9-263cde9636e9', 'Monsoon Index', 'solo', 2026, 'Krabi Boat Yard', 8.0863, 98.9063);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('0db5f251-55ff-4912-a190-52b59acf6210', '8378a4a5-3254-4010-b3d9-263cde9636e9', 'Coastal Signals', 'group', 2025, 'Phuket Old Town Hall', 7.8845, 98.3888);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('eb7d1ada-0a29-49df-8038-2630d77cbb6f', '8378a4a5-3254-4010-b3d9-263cde9636e9', 'monsoon-index', '927050', 'Monsoon Index', 570, 'Nine brass rods tuned to the pressure readings of a single storm season. The piece replays a year at the speed of an afternoon.', 15640, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('4335e9da-9160-4f1f-8c2d-ef03ecce2422', 'eb7d1ada-0a29-49df-8038-2630d77cbb6f');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('5f46daf7-c04d-448f-a77c-435a374fd1ca', '8378a4a5-3254-4010-b3d9-263cde9636e9', 'brass-in-the-rain', '202299', 'Brass in the Rain', 312, 'A sculpture left outdoors for three weeks and recorded each time it rained. Nothing was played by hand.', 11020, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('4335e9da-9160-4f1f-8c2d-ef03ecce2422', '5f46daf7-c04d-448f-a77c-435a374fd1ca');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('a129e349-4ddf-40ed-a467-92e0b620908b', '8378a4a5-3254-4010-b3d9-263cde9636e9', 'tide-machine', '253616', 'Tide Machine', 464, 'A rocking frame driven by the tide, striking a plate twice a minute. The score is written by the water.', 8455, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('0db5f251-55ff-4912-a190-52b59acf6210', 'a129e349-4ddf-40ed-a467-92e0b620908b');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('53eefabd-cb78-43d9-aea8-61ba90977074', '8378a4a5-3254-4010-b3d9-263cde9636e9', 'low-season', '233528', 'Low Season', 726, 'The same instrument in a month with no rain. Mostly silence, and what silence turns out to contain.', 5210, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('0db5f251-55ff-4912-a190-52b59acf6210', '53eefabd-cb78-43d9-aea8-61ba90977074');
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'prawit-chan', 'Prawit Chan', null, 'Bangkok', 'Thailand', 13.7563, 100.5018, 'Draws in charcoal, mostly hands and chairs. The sound of each drawing is kept as part of it.', 'linear-gradient(180deg,#F4F3EF,#E3E1DA)', '#141414', '#C9C6BC', 'Nov 2023 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'ig', 'prawit.draws');
insert into artist_contacts (artist_id, kind, value) values ('14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'email', 'prawitchan@gmail.com');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('22af4ef1-b77a-4110-bf13-99302d94c878', '14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'มือ (Hand Studies)', 'solo', 2023, 'Bangkok CityCity Gallery', 13.7222, 100.5423);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('bbd9a8ca-6cc9-441a-9fc4-0cf3b04acfb6', '14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'Paper Weight', 'group', 2025, 'Nova Contemporary, Bangkok', 13.7405, 100.5497);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('a4467ade-04e6-4df1-92f1-2acda66dd681', '14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'hand-study', '836514', 'มือ (Hand Study)', 125, 'Prawit''s own left hand, drawn without looking down. The sound is the stick against paper, nothing added.', 41260, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('22af4ef1-b77a-4110-bf13-99302d94c878', 'a4467ade-04e6-4df1-92f1-2acda66dd681');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('97efe7d8-2ff9-4b3f-9252-6ce93402ca85', '14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'empty-chair', '581574', 'เก้าอี้ว่าง (Empty Chair)', 198, 'A studio chair drawn every morning for a month, each version over the last. The audio is one of those mornings.', 29840, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('22af4ef1-b77a-4110-bf13-99302d94c878', '97efe7d8-2ff9-4b3f-9252-6ce93402ca85');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('7659a861-e6b2-4169-a130-19d628842dd1', '14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'late-light', '535301', 'แสงบ่าย (Late Light)', 112, 'Made in twenty minutes as the light left the room. He stopped when he could no longer see the page.', 22115, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('bbd9a8ca-6cc9-441a-9fc4-0cf3b04acfb6', '7659a861-e6b2-4169-a130-19d628842dd1');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('d35bbc36-82a4-4101-a542-1908089a5b67', '14a22a8f-c0f7-4493-8804-724bd4f3ee09', 'breath', '485473', 'ลมหายใจ (Breath)', 260, 'A drawing paced to breathing, one stroke per exhale. You can hear where he held it.', 16730, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('bbd9a8ca-6cc9-441a-9fc4-0cf3b04acfb6', 'd35bbc36-82a4-4101-a542-1908089a5b67');
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('7efecff4-ca52-49b5-af78-9a4f5805adc5', 'mai-sirichai', 'Mai Sirichai', null, 'Nan', 'Thailand', 18.7756, 100.7730, 'Makes cyanotypes in Nan from river plants, linen and a great deal of patience with the sun.', '#152ACB', '#D5DBFF', '#2A3ED8', 'May 2025 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('7efecff4-ca52-49b5-af78-9a4f5805adc5', 'ig', 'mai.sunprints');
insert into artist_contacts (artist_id, kind, value) values ('7efecff4-ca52-49b5-af78-9a4f5805adc5', 'line', 'maisunprint');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('105ae4f8-855b-4d3a-a9bb-6154fe2c2a0a', '7efecff4-ca52-49b5-af78-9a4f5805adc5', 'บันทึกแดด (Sunprint Diary)', 'solo', 2025, 'Nan Riverside Art Gallery', 18.9200, 100.6800);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('ced3df72-7190-4fe7-84c4-591172e5ca0e', '7efecff4-ca52-49b5-af78-9a4f5805adc5', 'Blue Hour', 'group', 2026, 'Chiang Mai Art Center', 18.7900, 98.9800);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('4d938c05-1405-47a1-8a9e-167365785b5b', '7efecff4-ca52-49b5-af78-9a4f5805adc5', 'sunprint-diary', '814048', 'บันทึกแดด (Sunprint Diary)', 400, 'A page exposed each day for sixty days on a windowsill in Nan. The sound is the street below at the hour of exposure.', 33180, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('105ae4f8-855b-4d3a-a9bb-6154fe2c2a0a', '4d938c05-1405-47a1-8a9e-167365785b5b');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('aafcb861-a19e-411e-888c-203cc84e87f1', '7efecff4-ca52-49b5-af78-9a4f5805adc5', 'nan-river', '637442', 'แม่น้ำน่าน (Nan River)', 492, 'River plants pressed straight onto the paper and left in the sun. Recorded at the bend where they were picked.', 27400, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('105ae4f8-855b-4d3a-a9bb-6154fe2c2a0a', 'aafcb861-a19e-411e-888c-203cc84e87f1');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('ed0ca0a5-cfa1-4b25-bba0-07a623109e3d', '7efecff4-ca52-49b5-af78-9a4f5805adc5', 'linen-drying', '358605', 'ผ้าตากลม (Linen, Drying)', 235, 'Linen drying on a line, printed as shadow. The audio is the cloth in wind, close.', 14260, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('ced3df72-7190-4fe7-84c4-591172e5ca0e', 'ed0ca0a5-cfa1-4b25-bba0-07a623109e3d');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('22a419b0-411f-434d-b93e-518d7949d122', '7efecff4-ca52-49b5-af78-9a4f5805adc5', 'leaf-shadow', '198698', 'เงาใบไม้ (Leaf Shadow)', 302, 'One leaf, one afternoon, moved twice. The blue records where it stayed longest.', 10940, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('ced3df72-7190-4fe7-84c4-591172e5ca0e', '22a419b0-411f-434d-b93e-518d7949d122');
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('c1091500-ad5d-40d3-86da-e68550cc8017', 'ruth-aldana', 'Ruth Aldana', null, 'Oaxaca', 'Mexico', 17.0732, -96.7266, 'Weaves on a pedal loom in Oaxaca, from patterns her family has kept by memory rather than on paper.', '#E8B21C', '#241A00', '#D9A312', 'Mar 2024 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('c1091500-ad5d-40d3-86da-e68550cc8017', 'ig', 'ruth.telar');
insert into artist_contacts (artist_id, kind, value) values ('c1091500-ad5d-40d3-86da-e68550cc8017', 'web', 'ruthaldana.mx');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('1dd5fe55-efb3-4dfd-9f76-eef510894016', 'c1091500-ad5d-40d3-86da-e68550cc8017', 'Warp, Weft, Warp', 'solo', 2024, 'Museo Textil de Oaxaca', 17.0605, -96.7240);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('6bd6ae3a-f6c4-4e48-af7c-7650143b033b', 'c1091500-ad5d-40d3-86da-e68550cc8017', 'Hand Held', 'group', 2026, 'Casa de la Cultura Oaxaquena', 17.0616, -96.7180);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('f2b9cf11-d876-46cd-8482-584b44035735', 'c1091500-ad5d-40d3-86da-e68550cc8017', 'warp-weft-warp', '160153', 'Warp, Weft, Warp', 660, 'A four-metre cloth woven over eleven days on a pedal loom. The recording runs the length of the work at real speed.', 38720, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('1dd5fe55-efb3-4dfd-9f76-eef510894016', 'f2b9cf11-d876-46cd-8482-584b44035735');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('dc23a697-ab64-4bff-993a-1a3c06080cf9', 'c1091500-ad5d-40d3-86da-e68550cc8017', 'loom-at-dusk', '906670', 'Loom at Dusk', 456, 'The last hour of weaving each day, when Ruth works by touch. The rhythm slows without her deciding to.', 25610, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('1dd5fe55-efb3-4dfd-9f76-eef510894016', 'dc23a697-ab64-4bff-993a-1a3c06080cf9');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('4553fa24-1f0d-42e8-8a42-873e336e6c3a', 'c1091500-ad5d-40d3-86da-e68550cc8017', 'indigo-count', '681518', 'Indigo Count', 284, 'Threads counted aloud in Zapotec as they were dyed. The count is the score.', 17880, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('6bd6ae3a-f6c4-4e48-af7c-7650143b033b', '4553fa24-1f0d-42e8-8a42-873e336e6c3a');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('4786d6d2-aa3b-4354-aa04-a98153ec3925', 'c1091500-ad5d-40d3-86da-e68550cc8017', 'thread-memory', '897147', 'Thread Memory', 548, 'A pattern her grandmother wove, remade from memory rather than from a drawing. The errors were kept.', 12045, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('6bd6ae3a-f6c4-4e48-af7c-7650143b033b', '4786d6d2-aa3b-4354-aa04-a98153ec3925');
insert into artists (id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, card_tint, joined_at) values ('7081116e-e666-4292-969b-05e8a6680389', 'nima-farhadi', 'Nima Farhadi', null, 'Lisbon', 'Portugal', 38.7223, -9.1393, 'Blows glass in Lisbon. Each piece is recorded from the first breath to the cooling rack.', 'linear-gradient(170deg,#B6A9F7,#9B8BEE)', '#1A1440', '#9B8BEE', 'Jun 2026 01'::timestamptz);
insert into artist_contacts (artist_id, kind, value) values ('7081116e-e666-4292-969b-05e8a6680389', 'ig', 'nima.glass');
insert into artist_contacts (artist_id, kind, value) values ('7081116e-e666-4292-969b-05e8a6680389', 'email', 'hello@nimafarhadi.pt');
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('ef02d6a0-2c74-4a7c-a280-f75ba082c4c8', '7081116e-e666-4292-969b-05e8a6680389', 'Three Breaths in Glass', 'solo', 2026, 'Galeria Ze dos Bois, Lisbon', 38.7112, -9.1447);
insert into exhibitions (id, artist_id, title, kind, year, venue, lat, lng) values ('6a4f3431-f631-4a24-86a2-a8ba3e212ee1', '7081116e-e666-4292-969b-05e8a6680389', 'Molten', 'group', 2025, 'MAAT, Lisbon', 38.6957, -9.1966);
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('9208328a-286e-4cc6-a65d-bf854cf454ac', '7081116e-e666-4292-969b-05e8a6680389', 'three-breaths', '446864', 'Three Breaths', 198, 'Three vessels, each formed in a single breath. The audio is those three breaths and nothing else.', 9840, 0);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('ef02d6a0-2c74-4a7c-a280-f75ba082c4c8', '9208328a-286e-4cc6-a65d-bf854cf454ac');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('4b35ada8-a01c-4828-b8c6-b75b67e91508', '7081116e-e666-4292-969b-05e8a6680389', 'furnace-song', '822901', 'Furnace Song', 326, 'The tone a glass furnace holds at 1,100 degrees. Nima tuned the studio around it for a week.', 7220, 1);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('ef02d6a0-2c74-4a7c-a280-f75ba082c4c8', '4b35ada8-a01c-4828-b8c6-b75b67e91508');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('427d655f-bf79-4fc6-97ff-f1a75dd2aacb', '7081116e-e666-4292-969b-05e8a6680389', 'cooling-rack', '487435', 'Cooling Rack', 164, 'Finished pieces annealing overnight. Glass ticks as it lets go of heat.', 4610, 2);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('6a4f3431-f631-4a24-86a2-a8ba3e212ee1', '427d655f-bf79-4fc6-97ff-f1a75dd2aacb');
insert into artworks (id, artist_id, slug, code, title, duration_sec, description, listen_count, sort_order) values ('0f87935d-77ca-42c2-b34c-b2048ef634f0', '7081116e-e666-4292-969b-05e8a6680389', 'glass-falling', '978795', 'Glass, Falling', 372, 'A failed piece, recorded as it broke. It is the only take.', 3155, 3);
insert into exhibition_artworks (exhibition_id, artwork_id) values ('6a4f3431-f631-4a24-86a2-a8ba3e212ee1', '0f87935d-77ca-42c2-b34c-b2048ef634f0');
commit;
-- Real art for Anong (mirrors migrations/0008_anong_real_art.sql)
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

-- Real art for the other artists (mirrors migrations/0009_real_art_all_artists.sql)
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


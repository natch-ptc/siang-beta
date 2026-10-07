-- Siang's own artist page, siang.co/siang, and the end of the made-up demo
-- artists. Needs 0015_v3_fields.sql and 0016_beta_checklist.sql to be run first.
--
-- 1. Deletes every artist row that no account owns: the ten seeded demo
--    artists (Anong Vetchakul, Kanit Prasong...), with their works, shows,
--    contacts and listens. Artists who signed up are not touched.
-- 2. Creates the artist "siang" (owned by no account; lib/beta.ts names it).
--    Its About holds the notes the team wrote for the landing page, and its
--    three works are complete examples, labelled "Example" by the app.
--
-- Safe to run again: it rebuilds the page from scratch each time.

begin;

delete from exhibitions where artist_id in (select id from artists where user_id is null);
delete from artists where user_id is null;

with siang as (
  insert into artists (slug, name, discipline, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values (
    'siang',
    'Siang',
    'Sound',
    'ศิลปะฟังได้ · หน้าทางการของทีม Siang ผลงานในหน้านี้เป็นตัวอย่าง ทำไว้ให้เห็นว่าหน้าศิลปินและหน้าผลงานที่ครบถ้วนเป็นอย่างไร',
    E'พวกเราเป็นกลุ่มเล็ก ๆ ของเอนจิเนียร์ที่เอนจอยอาร์ต เรารู้ว่าศิลปะแต่ละชิ้นมีคุณค่า เรื่องราว และเสียงของศิลปินทุกคนในนั้น พวกเราเลยอยากชวนทุกคนมาฟัง “เสียง” และให้ “เสียง” เป็นสื่อให้ศิลปินได้เล่าเรื่องราวผ่านเสียงพูด เสียงดนตรี หรือเสียงบรรยากาศของศิลปะแต่ละชิ้น\n'
    || E'ทีมเสียง Siang.co\n\n'
    || E'From Petch\n'
    || E'ช่วงที่ผ่านมาไป Museum ใช้ audio guide บ่อย ๆ เดิน Digital Exhibition เยอะ ๆ ก็เริ่มเคลิ้ม แต่ก็สงสัยว่าทำไม Artist ทุกคน ทำสิ่งนี้ ง่าย ๆ ไม่ได้นะ\n'
    || E'เลยเริ่มโทรคุยกับ Artist & Curator คืนนั้นเลย จนเกิดเป็น “Siang” ด้วยเป้าหมายที่อยากให้ทั้งคนทำงานอาร์ต และคนดู แฮปปี้มากขึ้น!\n'
    || E'ก่อนหน้านี้แอบรู้สึก เหมือนคนเจ้าชู้ ฝั่งหนึ่งก็ทำงาน Technology สุดตัว อีกฝั่งก็งาน Creative หลุดโลก เพื่อน ๆ เริ่มงง ว่าเราทำงานอะไรกันแน่ 555+\n'
    || E'แต่ตอนนี้หน่ะ ฉันเองก็เป็นได้นะ Creative Technologist!\n'
    || E'Kunpoj, กันต์พจน์, เพชร (Petch) · คนคิดค้น Siang.co / CEO / เบ๊\n\n'
    || E'From Natch\n'
    || E'สวัสดีครับสายผลิตและคนรักงานอาร์ต ยินดีมาก ๆ ที่ได้มาทำ Project เจ๋ง ๆ แบบนี้ให้ศิลปินได้ใช้\n'
    || E'อยากให้พวกเราที่เป็นสายเสพอาร์ตฟินที่ได้ยินเสียงของอาร์ตแต่ละชิ้นครับ จะได้ไปตามดูศิลปะจริง ๆ\n'
    || E'พอทำโปรเจคก็เลยได้คุยกับศิลปินและไปงานอาร์ตเยอะขึ้นอีก ขอบคุณพี่ ๆ เพื่อน ๆ ศิลปินที่ให้ฟี้ดแบ็คตลอดมานะครับ ตอนนี้ยังเป็นรอบเบต้า จะตั้งใจพัฒนาต่อไปครับ\n'
    || E'Natch R. Soros · Dev และ Operation Manager ของ Siang.co',
    '/siang-avatar.svg',
    '#000000',
    '#ffffff',
    'Asia/Bangkok'
  )
  returning id
),
contact as (
  insert into artist_contacts (artist_id, kind, value) select id, 'web', 'siang.co' from siang
),
link as (
  insert into artist_links (artist_id, label, url, sort_order) select id, 'About Siang', 'https://www.siang.co/about', 0 from siang
),
works as (
  insert into artworks (
    artist_id, slug, code, title, title_en, description, cover_url, audio_url, duration_sec, sort_order, created_at,
    year, medium, size_text, height_cm, width_cm, materials, edition, availability, location_now, credits
  )
  select siang.id, w.slug, w.code, w.title, w.title_en, w.description, w.cover_url, w.audio_url, w.duration_sec, w.sort_order, now() - w.age,
         2026, w.medium, w.size_text, w.height_cm, w.width_cm, w.materials, w.edition, 'not_for_sale', 'ตัวอย่างเท่านั้น ไม่มีงานจริงจัดแสดง', w.credits
  from siang, (values
    (
      'still-water', '982780', 'น้ำนิ่ง', 'Still Water', 0, interval '0 minutes',
      E'นี่คือผลงานตัวอย่างจากทีม Siang ทำไว้ให้เห็นว่าหน้าผลงานที่ครบถ้วนมีอะไรบ้าง: รูป เสียง เรื่องเล่า และรายละเอียดของงาน\n\nลองกดฟังเสียงด้านบน ศิลปินอัดเสียงแบบนี้เองได้ จะเล่าที่มาของงาน เปิดเสียงตอนทำงาน หรือใส่ดนตรีก็ได้ ยาวสักหนึ่งนาทีกำลังดี',
      '/art/pottery-flat-bowl-johnston.jpg', '/audio/examples/chiming-pottery.mp3', 27,
      'Ceramics', '9 × 32 × 32 cm', 9::numeric, 32::numeric, 'Stoneware, celadon glaze', 'Unique',
      'Example made by the Siang team. Picture: Index of American Design, National Gallery of Art, public domain. Sound: "Chiming pottery" by stephan, public domain, Wikimedia Commons.'
    ),
    (
      'morning-bell', '135742', 'ระฆังเช้า', 'Morning Bell', 1, interval '1 minute',
      E'ผลงานตัวอย่างชิ้นที่สอง ผลงานทุกชิ้นบน Siang มี QR และรหัส 6 หลักของตัวเอง ดูรหัสของชิ้นนี้ได้ที่รายละเอียดด้านล่าง\n\nศิลปินพิมพ์ QR ไปติดข้างงานจริง คนดูสแกนแล้วมาฟังเสียงที่หน้านี้ได้ทันที ไม่ต้องโหลดแอป',
      '/art/java-temple-bell.jpg', '/audio/examples/bell.mp3', 64,
      'Sculpture', '48 × 30 × 30 cm', 48::numeric, 30::numeric, 'Bronze', 'Unique',
      'Example made by the Siang team. Picture: The Metropolitan Museum of Art, public domain. Sound: "Gong or bell vibrant" by stephan, public domain, Wikimedia Commons.'
    ),
    (
      'cut-against-grain', '906670', 'ตัดทวนลายไม้', 'Cut Against Grain', 2, interval '2 minutes',
      E'ผลงานตัวอย่างชิ้นที่สาม ศิลปินเพิ่มผลงานได้ทีละชิ้น กี่ชิ้นก็ได้ เมื่อไรก็ได้ และจัดหลายชิ้นรวมเป็นคอลเลกชันได้\n\nงานที่ยังไม่มีเสียงก็ลงได้ก่อน แล้วค่อยกลับมาใส่เสียงทีหลัง',
      '/art/durer-woodblock-samson.jpg', '/audio/examples/paper.mp3', 78,
      'Printmaking', '38 × 28 cm', 38::numeric, 28::numeric, 'Woodcut on paper', 'Edition of 20',
      'Example made by the Siang team. Picture: The Metropolitan Museum of Art, public domain. Sound: "Book paper pages assorted" by stephan, public domain, Wikimedia Commons.'
    )
  ) as w (slug, code, title, title_en, sort_order, age, description, cover_url, audio_url, duration_sec, medium, size_text, height_cm, width_cm, materials, edition, credits)
  returning id
),
collection as (
  -- No venue, so it is a collection, not an exhibition.
  insert into exhibitions (artist_id, slug, title, kind, year)
  select id, 'example-works', 'ผลงานตัวอย่าง (Example works)', 'solo', 2026 from siang
  returning id
)
insert into exhibition_artworks (exhibition_id, artwork_id)
select collection.id, works.id from collection, works;

commit;

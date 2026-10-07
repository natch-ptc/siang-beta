-- Siang's own artist page, siang.co/siang ("Siang Official"), and a clean
-- start for the beta. Needs 0015_v3_fields.sql and 0016_beta_checklist.sql
-- to be run first.
--
-- 1. Deletes every artist page: the ten made-up demo artists and every page
--    made while testing, with their works, shows, contacts, links and
--    listens. Accounts (auth.users) are kept: signing in again starts a new
--    page. Uploaded files stay in storage.
-- 2. Creates the artist "siang", Siang Official (owned by no account;
--    lib/beta.ts names it). Its About holds the notes the team wrote for the
--    landing page, and its works are examples, labelled "Example" by the app:
--    five with a sound, three without, every one with its details filled in.
--
-- Safe to run again: it rebuilds the page from scratch each time.

begin;

delete from exhibitions;
delete from artists;

with siang as (
  insert into artists (slug, name, discipline, bio, statement, avatar_url, card_bg, card_ink, joined_tz)
  values (
    'siang',
    'Siang Official',
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
    '/siang-avatar.png',
    '#B6386F',
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
      E'นี่คือผลงานตัวอย่างจากทีม Siang ทำไว้ให้เห็นว่าหน้าผลงานที่ครบถ้วนมีอะไรบ้าง: รูป เสียง เรื่องเล่า และรายละเอียดของงาน

ลองกดฟังเสียงด้านบน ศิลปินอัดเสียงแบบนี้เองได้ จะเล่าที่มาของงาน เปิดเสียงตอนทำงาน หรือใส่ดนตรีก็ได้ ยาวสักหนึ่งนาทีกำลังดี',
      '/art/pottery-flat-bowl-johnston.jpg', '/audio/examples/chiming-pottery.mp3', 27::int,
      'Ceramics', '9 × 32 × 32 cm', 9::numeric, 32::numeric, 'Stoneware, celadon glaze', 'Unique',
      'Example made by the Siang team. Picture: Index of American Design, National Gallery of Art, public domain. Sound: "Chiming pottery" by stephan, public domain, Wikimedia Commons.'
    ),
    (
      'morning-bell', '135742', 'ระฆังเช้า', 'Morning Bell', 1, interval '1 minutes',
      E'ผลงานตัวอย่าง ผลงานทุกชิ้นบน Siang มี QR และรหัส 6 หลักของตัวเอง ดูรหัสของชิ้นนี้ได้ที่รายละเอียดด้านล่าง

ศิลปินพิมพ์ QR ไปติดข้างงานจริง คนดูสแกนแล้วมาฟังเสียงที่หน้านี้ได้ทันที ไม่ต้องโหลดแอป',
      '/art/java-temple-bell.jpg', '/audio/examples/bell.mp3', 64::int,
      'Sculpture', '48 × 30 × 30 cm', 48::numeric, 30::numeric, 'Bronze', 'Unique',
      'Example made by the Siang team. Picture: The Metropolitan Museum of Art, public domain. Sound: "Gong or bell vibrant" by stephan, public domain, Wikimedia Commons.'
    ),
    (
      'weather-vane', '418306', 'ลมเหนือหลังคา', 'Weather Vane', 2, interval '2 minutes',
      E'ผลงานตัวอย่าง เสียงไม่จำเป็นต้องเป็นเสียงพูด เสียงของวัสดุ ของสถานที่ หรือของลมที่พัดผ่านงาน ก็เล่าเรื่องได้เหมือนกัน',
      '/art/weather-vane-eiseman.jpg', '/audio/examples/wind.mp3', 67::int,
      'Sculpture', 'variable, about 60 × 90 cm', 60::numeric, 90::numeric, 'Sheet copper, iron rod', 'Unique',
      'Example made by the Siang team. Picture: public domain, from a museum open-access collection. Sound: "Windchime" by stephan, public domain, Wikimedia Commons.'
    ),
    (
      'hand-study', '527914', 'มือ', 'Hand Study', 3, interval '3 minutes',
      E'ผลงานตัวอย่าง เสียงดินสอบนกระดาษตอนวาดชิ้นนี้ ศิลปินหลายคนเก็บเสียงระหว่างทำงานไว้ เป็นส่วนหนึ่งของผลงาน',
      '/art/sargent-hands.jpg', '/audio/examples/pencil.mp3', 82::int,
      'Drawing', '25 × 35 cm', 25::numeric, 35::numeric, 'Graphite on paper', 'Unique',
      'Example made by the Siang team. Picture: public domain, from a museum open-access collection. Sound: "Pencil scratchings" by gypsygirl, public domain, Wikimedia Commons.'
    ),
    (
      'cut-against-grain', '906670', 'ตัดทวนลายไม้', 'Cut Against Grain', 4, interval '4 minutes',
      E'ผลงานตัวอย่าง ศิลปินเพิ่มผลงานได้ทีละชิ้น กี่ชิ้นก็ได้ เมื่อไรก็ได้ และจัดหลายชิ้นรวมเป็นคอลเลกชันได้',
      '/art/durer-woodblock-samson.jpg', '/audio/examples/paper.mp3', 78::int,
      'Printmaking', '38 × 28 cm', 38::numeric, 28::numeric, 'Woodcut on paper', 'Edition of 20',
      'Example made by the Siang team. Picture: The Metropolitan Museum of Art, public domain. Sound: "Book paper pages assorted" by stephan, public domain, Wikimedia Commons.'
    ),
    (
      'after-dinner', '640271', 'หลังมื้อค่ำ', 'After Dinner', 5, interval '5 minutes',
      E'ผลงานตัวอย่างที่ยังไม่มีเสียง งานที่ยังไม่มีเสียงก็ลงได้ก่อน รูปและเรื่องเล่าจะนำหน้า แล้วค่อยกลับมาใส่เสียงทีหลังได้

แสงตะเกียงตกลงบนโต๊ะหลังมื้อค่ำ คนในห้องยังนั่งอยู่ แต่บทสนทนาเงียบไปแล้ว',
      '/art/monet-interior-after-dinner.jpg', null, null::int,
      'Painting', '50 × 65 cm', 50::numeric, 65::numeric, 'Oil on canvas', 'Unique',
      'Example made by the Siang team. Picture: public domain, from a museum open-access collection.'
    ),
    (
      'blue-crane', '759138', 'นกกระสา', 'Blue Crane', 6, interval '6 minutes',
      E'ผลงานตัวอย่างที่ยังไม่มีเสียง ใส่รายละเอียดอย่างขนาด เทคนิค หรือราคาไว้ได้ คนที่สนใจจะรู้ว่างานจริงใหญ่แค่ไหน และติดต่อศิลปินได้',
      '/art/havell-blue-crane.jpg', null, null::int,
      'Printmaking', '66 × 98 cm', 66::numeric, 98::numeric, 'Hand-coloured engraving and aquatint', 'Edition of 150',
      'Example made by the Siang team. Picture: public domain, from a museum open-access collection.'
    ),
    (
      'coverlet', '283645', 'ผ้าห่มลายดาว', 'Star Coverlet', 7, interval '7 minutes',
      E'ผลงานตัวอย่างที่ยังไม่มีเสียง ผ้า งานปัก งานทอ ก็มีหน้าผลงานได้เหมือนงานศิลปะประเภทอื่น',
      '/art/coverlet-cornelius.jpg', null, null::int,
      'Textile', '210 × 180 cm', 210::numeric, 180::numeric, 'Wool and cotton, jacquard woven', 'Unique',
      'Example made by the Siang team. Picture: Index of American Design, National Gallery of Art, public domain.'
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

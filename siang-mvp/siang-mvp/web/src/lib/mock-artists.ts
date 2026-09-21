import type { ArtistCard } from "./types";

// Stand-in for a `select * from artists ... join artworks ... join exhibitions` query.
// Replace with a real Supabase fetch once the project is seeded — see supabase/migrations/0001_init.sql.
export const OWNED: ArtistCard[] = [
  {
    id: "anong",
    slug: "anong-vetchakul",
    name: "Anong Vetchakul",
    based: "Chiang Mai",
    country: "Thailand",
    addedAt: "2026-04-12T19:04",
    // Fritz Boehmer, "Pa. German Bowl," c. 1939 — National Gallery of Art,
    // Open Access (public domain). Scrim keeps the footer/plate text legible.
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/pa-german-bowl-boehmer.jpg') center/cover no-repeat",
    cardInk: "#FCE7F1",
    tint: "#B63878",
    markId: "anong",
    avatarUrl: "/art/pa-german-bowl-boehmer.jpg",
    bio: "Throws thin celadon in a small studio near the Ping river. Every work is recorded inside the kiln while it fires.",
    geo: "18.7883,98.9853",
    joined: "Feb 2025",
    monthlyListeners: 3410,
    contacts: [
      { kind: "ig", value: "anong.clay" },
      { kind: "email", value: "studio@anongvetchakul.com" },
      { kind: "web", value: "anongvetchakul.com" },
    ],
    // Cover photos below are real open-access watercolors from the National
    // Gallery of Art's Index of American Design (public domain), standing in
    // for artist-uploaded photos: Annie B. Johnston, "Pottery Flat Bowl" (c.
    // 1938); Sydney Roberts, "Pottery Jug" (c. 1941); Nicholas Amantea,
    // "Crock" (c. 1936); Fritz Boehmer, "Pa. German Bowl" (c. 1939).
    art: [
      { id: "still-water", code: "107919", title: "น้ำนิ่ง (Still Water)", durationLabel: "3:12", listenCount: 24810, showIndex: 0, description: "A shallow celadon basin, thrown thin enough that light passes through the rim. The recording is the kiln at hour eleven, when the glaze begins to move.", coverUrl: "/art/pottery-flat-bowl-johnston.jpg" },
      { id: "clay-and-fire", code: "115838", title: "ดินกับไฟ (Clay and Fire)", durationLabel: "4:48", listenCount: 18240, showIndex: 0, description: "Two vessels fired in the same load, one pulled early. What you hear is the cooling, forty minutes compressed into five.", coverUrl: "/art/pottery-jug-roberts.jpg" },
      { id: "sixth-bowl", code: "123757", title: "ถ้วยที่หก (Sixth Bowl)", durationLabel: "2:36", listenCount: 9615, showIndex: 1, description: "The sixth attempt at a form Anong had been circling for a year. She kept the crack and glazed over it.", coverUrl: "/art/crock-amantea.jpg" },
      { id: "kiln-wind", code: "131676", title: "ลมในเตา (Kiln Wind)", durationLabel: "6:04", listenCount: 7302, showIndex: 1, description: "Air moving through the chamber before the fire is lit. Nothing is being made yet, which is the point.", coverUrl: "/art/pa-german-bowl-boehmer.jpg" },
    ],
    shows: [
      { title: "น้ำนิ่ง (Still Water, Turning)", kind: "Solo", year: 2025, venue: "Gallery Seescape, Chiang Mai", geo: "18.7955,98.9722" },
      { title: "ดินเผา (Fired Earth)", kind: "Group", year: 2024, venue: "MAIIAM Contemporary Art Museum", geo: "18.7638,99.0508" },
    ],
  },
  {
    id: "kanit",
    slug: "kanit-prasong",
    name: "Kanit Prasong",
    based: "Bangkok",
    country: "Thailand",
    addedAt: "2026-02-02T08:26",
    // Real art, NGA Open Access (public domain): Edouard Manet, "The Railway"; Claude Monet, "Interior, after Dinner"; Charles Nègre, "Scène de Marché au Port de l'Hôtel de Ville, Paris (Market Scene at the Port of the Hôtel de Ville, Paris)"; Robert Henri, "Volendam Street Scene"; Édouard-Denis Baldus, "Toulon, Gare (Toulon, Train Station)".
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/manet-railway.jpg') center/cover no-repeat",
    cardInk: "#F6F1EA",
    tint: "#1B1B1B",
    markId: "kanit",
    avatarUrl: "/art/manet-railway.jpg",
    bio: "Records rooms, markets and train platforms around Bangkok, usually in the hour before anyone arrives.",
    geo: "13.7563,100.5018",
    joined: "Aug 2024",
    monthlyListeners: 12750,
    contacts: [
      { kind: "ig", value: "kanit.hears" },
      { kind: "email", value: "kanit@roomtone.studio" },
    ],
    art: [
      { id: "room-tone-no7", code: "139595", title: "Room Tone No.7", durationLabel: "18:02", listenCount: 88420, showIndex: 0, description: "Eighteen minutes of an empty apartment in Ari, recorded the week before it was pulled down. Traffic arrives through a single open window.", coverUrl: "/art/monet-interior-after-dinner.jpg" },
      { id: "market-4am", code: "147514", title: "ตลาดตอนตีสี่ (Market, 4am)", durationLabel: "9:15", listenCount: 64180, showIndex: 0, description: "Khlong Toei at four in the morning, when the trucks arrive and nobody is speaking yet. Kanit walked one length of the market without stopping.", coverUrl: "/art/negre-marche.jpg" },
      { id: "rain-on-zinc", code: "155433", title: "ฝนบนหลังคาสังกะสี (Rain on Zinc)", durationLabel: "6:40", listenCount: 51930, showIndex: 1, description: "A zinc roof in the rainy season, from directly beneath. The pitch rises as the sheet warms.", coverUrl: "/art/henri-volendam.jpg" },
      { id: "empty-platform", code: "163352", title: "Empty Platform", durationLabel: "11:28", listenCount: 33470, showIndex: 1, description: "Recorded at the end of the line after the last train. The station keeps humming long after the doors close.", coverUrl: "/art/baldus-toulon-gare.jpg" },
    ],
    shows: [
      { title: "เสียงห้อง (Room Tone)", kind: "Solo", year: 2024, venue: "Bangkok Art and Culture Centre", geo: "13.7466,100.5300" },
      { title: "Night Transit", kind: "Group", year: 2026, venue: "Warehouse 30, Charoenkrung", geo: "13.7239,100.5150" },
    ],
  },
  {
    id: "fieldstatic",
    slug: "field-and-static",
    name: "Field & Static",
    based: "Krabi",
    country: "Thailand",
    addedAt: "2026-06-19T21:14",
    // Real art, NGA Open Access (public domain): Dorothy Hay Jensen, "Dragon Weather Vane"; Frank Eiseman, "Weather Vane"; Randolph F. Miller, "Brass Bell"; Edith Towner, "Ship's Bell"; Carl Strehlau, "Weather Vane".
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/dragon-weather-vane-jensen.jpg') center/cover no-repeat",
    cardInk: "#F6F1EA",
    tint: "#1F5340",
    markId: "fieldstatic",
    avatarUrl: "/art/dragon-weather-vane-jensen.jpg",
    bio: "A two-person studio in Krabi building brass instruments for the weather to play.",
    geo: "8.0863,98.9063",
    joined: "Jan 2026",
    monthlyListeners: 2180,
    contacts: [
      { kind: "ig", value: "fieldandstatic" },
      { kind: "web", value: "fieldandstatic.com" },
    ],
    art: [
      { id: "monsoon-index", code: "171271", title: "Monsoon Index", durationLabel: "9:30", listenCount: 15640, showIndex: 0, description: "Nine brass rods tuned to the pressure readings of a single storm season. The piece replays a year at the speed of an afternoon.", coverUrl: "/art/weather-vane-eiseman.jpg" },
      { id: "brass-in-the-rain", code: "179190", title: "Brass in the Rain", durationLabel: "5:12", listenCount: 11020, showIndex: 0, description: "A sculpture left outdoors for three weeks and recorded each time it rained. Nothing was played by hand.", coverUrl: "/art/brass-bell-miller.jpg" },
      { id: "tide-machine", code: "187109", title: "Tide Machine", durationLabel: "7:44", listenCount: 8455, showIndex: 1, description: "A rocking frame driven by the tide, striking a plate twice a minute. The score is written by the water.", coverUrl: "/art/ships-bell-towner.jpg" },
      { id: "low-season", code: "195028", title: "Low Season", durationLabel: "12:06", listenCount: 5210, showIndex: 1, description: "The same instrument in a month with no rain. Mostly silence, and what silence turns out to contain.", coverUrl: "/art/weather-vane-strehlau.jpg" },
    ],
    shows: [
      { title: "Monsoon Index", kind: "Solo", year: 2026, venue: "Krabi Boat Yard", geo: "8.0863,98.9063" },
      { title: "Coastal Signals", kind: "Group", year: 2025, venue: "Phuket Old Town Hall", geo: "7.8845,98.3888" },
    ],
  },
  {
    id: "prawit",
    slug: "prawit-chan",
    name: "Prawit Chan",
    based: "Bangkok",
    country: "Thailand",
    addedAt: "2025-11-30T13:47",
    // Real art, NGA Open Access (public domain): Paul Cezanne, "Cushion of an Armchair"; John Singer Sargent, "Studies of Hands"; Sir David Wilkie, "Study of a Chair Leg"; John Sell Cotman, "Sketch of Ruined Church Interior with Chair"; Jacopo Guarana, "Three Studies of Hands Clasped in Prayer".
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/cezanne-armchair-cushion.jpg') center/cover no-repeat",
    cardInk: "#F6F1EA",
    tint: "#C9C6BC",
    markId: "prawit",
    avatarUrl: "/art/cezanne-armchair-cushion.jpg",
    bio: "Draws in charcoal, mostly hands and chairs. The sound of each drawing is kept as part of it.",
    geo: "13.7563,100.5018",
    joined: "Nov 2023",
    monthlyListeners: 6890,
    contacts: [
      { kind: "ig", value: "prawit.draws" },
      { kind: "email", value: "prawitchan@gmail.com" },
    ],
    art: [
      { id: "hand-study", code: "202947", title: "มือ (Hand Study)", durationLabel: "2:05", listenCount: 41260, showIndex: 0, description: "Prawit's own left hand, drawn without looking down. The sound is the stick against paper, nothing added.", coverUrl: "/art/sargent-hands.jpg" },
      { id: "empty-chair", code: "210866", title: "เก้าอี้ว่าง (Empty Chair)", durationLabel: "3:18", listenCount: 29840, showIndex: 0, description: "A studio chair drawn every morning for a month, each version over the last. The audio is one of those mornings.", coverUrl: "/art/wilkie-chair-leg.jpg" },
      { id: "late-light", code: "218785", title: "แสงบ่าย (Late Light)", durationLabel: "1:52", listenCount: 22115, showIndex: 1, description: "Made in twenty minutes as the light left the room. He stopped when he could no longer see the page.", coverUrl: "/art/cotman-church-chair.jpg" },
      { id: "breath", code: "226704", title: "ลมหายใจ (Breath)", durationLabel: "4:20", listenCount: 16730, showIndex: 1, description: "A drawing paced to breathing, one stroke per exhale. You can hear where he held it.", coverUrl: "/art/guarana-hands-prayer.jpg" },
    ],
    shows: [
      { title: "มือ (Hand Studies)", kind: "Solo", year: 2023, venue: "Bangkok CityCity Gallery", geo: "13.7222,100.5423" },
      { title: "Paper Weight", kind: "Group", year: 2025, venue: "Nova Contemporary, Bangkok", geo: "13.7405,100.5497" },
    ],
  },
  {
    id: "mai",
    slug: "mai-sirichai",
    name: "Mai Sirichai",
    based: "Nan",
    country: "Thailand",
    addedAt: "2026-01-07T07:52",
    // Real art, NGA Open Access (public domain): Charles-François Daubigny, "Washerwomen at the Oise River near Valmondois"; Robert Havell after John James Audubon, "Blue Crane or Heron"; Jean-Baptiste-Camille Corot, "River View"; James McNeill Whistler, "Clothes Exchange, No.I"; Heinrich Aldegrever, "Sprig of Ornamental Foliage with Two Masks and Two Dolphins".
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/daubigny-washerwomen.jpg') center/cover no-repeat",
    cardInk: "#F6F1EA",
    tint: "#2A3ED8",
    markId: "mai",
    avatarUrl: "/art/daubigny-washerwomen.jpg",
    bio: "Makes cyanotypes in Nan from river plants, linen and a great deal of patience with the sun.",
    geo: "18.7756,100.7730",
    joined: "May 2025",
    monthlyListeners: 4620,
    contacts: [
      { kind: "ig", value: "mai.sunprints" },
      { kind: "line", value: "maisunprint" },
    ],
    art: [
      { id: "sunprint-diary", code: "234623", title: "บันทึกแดด (Sunprint Diary)", durationLabel: "6:40", listenCount: 33180, showIndex: 0, description: "A page exposed each day for sixty days on a windowsill in Nan. The sound is the street below at the hour of exposure.", coverUrl: "/art/havell-blue-crane.jpg" },
      { id: "nan-river", code: "242542", title: "แม่น้ำน่าน (Nan River)", durationLabel: "8:12", listenCount: 27400, showIndex: 0, description: "River plants pressed straight onto the paper and left in the sun. Recorded at the bend where they were picked.", coverUrl: "/art/corot-river-view.jpg" },
      { id: "linen-drying", code: "250461", title: "ผ้าตากลม (Linen, Drying)", durationLabel: "3:55", listenCount: 14260, showIndex: 1, description: "Linen drying on a line, printed as shadow. The audio is the cloth in wind, close.", coverUrl: "/art/whistler-clothes-exchange.jpg" },
      { id: "leaf-shadow", code: "258380", title: "เงาใบไม้ (Leaf Shadow)", durationLabel: "5:02", listenCount: 10940, showIndex: 1, description: "One leaf, one afternoon, moved twice. The blue records where it stayed longest.", coverUrl: "/art/aldegrever-foliage.jpg" },
    ],
    shows: [
      { title: "บันทึกแดด (Sunprint Diary)", kind: "Solo", year: 2025, venue: "Nan Riverside Art Gallery", geo: "18.9200,100.6800" },
      { title: "Blue Hour", kind: "Group", year: 2026, venue: "Chiang Mai Art Center", geo: "18.7900,98.9800" },
    ],
  },
  {
    id: "ruth",
    slug: "ruth-aldana",
    name: "Ruth Aldana",
    based: "Oaxaca",
    country: "Mexico",
    addedAt: "2025-08-24T16:30",
    // Real art, NGA Open Access (public domain): Cornelius Christoffels, "Coverlet"; Edward L. Loper, "Coverlet"; Edmond W. Brown, "Wool Coverlet"; Regina Henderer, "Coverlet"; Jules Lefevere, "Embroidered Coverlet".
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/coverlet-cornelius.jpg') center/cover no-repeat",
    cardInk: "#F6F1EA",
    tint: "#D9A312",
    markId: "ruth",
    avatarUrl: "/art/coverlet-cornelius.jpg",
    bio: "Weaves on a pedal loom in Oaxaca, from patterns her family has kept by memory rather than on paper.",
    geo: "17.0732,-96.7266",
    joined: "Mar 2024",
    monthlyListeners: 5140,
    contacts: [
      { kind: "ig", value: "ruth.telar" },
      { kind: "web", value: "ruthaldana.mx" },
    ],
    art: [
      { id: "warp-weft-warp", code: "266299", title: "Warp, Weft, Warp", durationLabel: "11:00", listenCount: 38720, showIndex: 0, description: "A four-metre cloth woven over eleven days on a pedal loom. The recording runs the length of the work at real speed.", coverUrl: "/art/coverlet-loper.jpg" },
      { id: "loom-at-dusk", code: "274218", title: "Loom at Dusk", durationLabel: "7:36", listenCount: 25610, showIndex: 0, description: "The last hour of weaving each day, when Ruth works by touch. The rhythm slows without her deciding to.", coverUrl: "/art/coverlet-wool-brown.jpg" },
      { id: "indigo-count", code: "282137", title: "Indigo Count", durationLabel: "4:44", listenCount: 17880, showIndex: 1, description: "Threads counted aloud in Zapotec as they were dyed. The count is the score.", coverUrl: "/art/coverlet-henderer.jpg" },
      { id: "thread-memory", code: "290056", title: "Thread Memory", durationLabel: "9:08", listenCount: 12045, showIndex: 1, description: "A pattern her grandmother wove, remade from memory rather than from a drawing. The errors were kept.", coverUrl: "/art/coverlet-lefevere.jpg" },
    ],
    shows: [
      { title: "Warp, Weft, Warp", kind: "Solo", year: 2024, venue: "Museo Textil de Oaxaca", geo: "17.0605,-96.7240" },
      { title: "Hand Held", kind: "Group", year: 2026, venue: "Casa de la Cultura Oaxaquena", geo: "17.0616,-96.7180" },
    ],
  },
  {
    id: "nima",
    slug: "nima-farhadi",
    name: "Nima Farhadi",
    based: "Lisbon",
    country: "Portugal",
    addedAt: "2026-07-15T11:08",
    // Real art, NGA Open Access (public domain): Yolande Delasser, "Flask"; Isadore Goldberg, "Gemel Bottle"; Yolande Delasser, "Ring Bottle"; Frank Fumagalli, "Flask"; Giacinto Capelli, "Ring Bottle".
    cardBg:
      "linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url('/art/flask-delasser.jpg') center/cover no-repeat",
    cardInk: "#F6F1EA",
    tint: "#9B8BEE",
    markId: "nima",
    avatarUrl: "/art/flask-delasser.jpg",
    bio: "Blows glass in Lisbon. Each piece is recorded from the first breath to the cooling rack.",
    geo: "38.7223,-9.1393",
    joined: "Jun 2026",
    monthlyListeners: 1980,
    contacts: [
      { kind: "ig", value: "nima.glass" },
      { kind: "email", value: "hello@nimafarhadi.pt" },
    ],
    art: [
      { id: "three-breaths", code: "297975", title: "Three Breaths", durationLabel: "3:18", listenCount: 9840, showIndex: 0, description: "Three vessels, each formed in a single breath. The audio is those three breaths and nothing else.", coverUrl: "/art/gemel-bottle-goldberg.jpg" },
      { id: "furnace-song", code: "305894", title: "Furnace Song", durationLabel: "5:26", listenCount: 7220, showIndex: 0, description: "The tone a glass furnace holds at 1,100 degrees. Nima tuned the studio around it for a week.", coverUrl: "/art/ring-bottle-delasser.jpg" },
      { id: "cooling-rack", code: "313813", title: "Cooling Rack", durationLabel: "2:44", listenCount: 4610, showIndex: 1, description: "Finished pieces annealing overnight. Glass ticks as it lets go of heat.", coverUrl: "/art/flask-fumagalli.jpg" },
      { id: "glass-falling", code: "321732", title: "Glass, Falling", durationLabel: "6:12", listenCount: 3155, showIndex: 1, description: "A failed piece, recorded as it broke. It is the only take.", coverUrl: "/art/ring-bottle-capelli.jpg" },
    ],
    shows: [
      { title: "Three Breaths in Glass", kind: "Solo", year: 2026, venue: "Galeria Ze dos Bois, Lisbon", geo: "38.7112,-9.1447" },
      { title: "Molten", kind: "Group", year: 2025, venue: "MAAT, Lisbon", geo: "38.6957,-9.1966" },
    ],
  },
];

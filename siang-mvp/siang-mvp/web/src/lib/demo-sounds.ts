// Example sounds for the seeded demo artists (siang.co/demo), whose works have
// no recording of their own. Each is a freely licensed file from Wikimedia
// Commons, stored in public/audio/demo; see CREDITS.md there. A registered
// artist never gets one: a work of theirs without sound simply has no player.
export type DemoSound = { url: string; seconds: number; credit: string };

const DEMO_SOUNDS: Record<string, DemoSound> = {
  "anong-vetchakul": { url: "/audio/demo/anong-vetchakul.mp3", seconds: 27, credit: "\"Chiming pottery\" by stephan, Public domain, Wikimedia Commons" },
  "somchai-ratana": { url: "/audio/demo/somchai-ratana.mp3", seconds: 64, credit: "\"Gong or bell vibrant\" by stephan, Public domain, Wikimedia Commons" },
  "field-and-static": { url: "/audio/demo/field-and-static.mp3", seconds: 67, credit: "\"Windchime\" by stephan, Public domain, Wikimedia Commons" },
  "prawit-chan": { url: "/audio/demo/prawit-chan.mp3", seconds: 82, credit: "\"Pencil scratchings\" by gypsygirl, Public domain, Wikimedia Commons" },
  "ruth-aldana": { url: "/audio/demo/ruth-aldana.mp3", seconds: 107, credit: "\"WWS Loom\" by Work With Sounds / Konrad Gutkowski, CC BY 4.0, Wikimedia Commons" },
  "nima-farhadi": { url: "/audio/demo/nima-farhadi.mp3", seconds: 18, credit: "\"WWS Fireoftheforge\" by Work With Sounds / La Fonderie, CC BY 4.0, Wikimedia Commons" },
  "mai-sirichai": { url: "/audio/demo/mai-sirichai.mp3", seconds: 62, credit: "\"Río Quillcay desde el puente Quillcay\" by Huandy Laguna Ibarra, CC BY 4.0, Wikimedia Commons" },
  "kanit-prasong": { url: "/audio/demo/kanit-prasong.mp3", seconds: 160, credit: "\"WWS TheStationTunnelOfTheTampereStation\" by Work With Sounds / Werstas, CC BY 4.0, Wikimedia Commons" },
  "ines-duarte": { url: "/audio/demo/ines-duarte.mp3", seconds: 14, credit: "\"Air conditioner hum (Gravity Sound)\" by Gravity Sound, CC BY 4.0, Wikimedia Commons" },
  "lek-thammawong": { url: "/audio/demo/lek-thammawong.mp3", seconds: 78, credit: "\"Book paper pages assorted\" by stephan, Public domain, Wikimedia Commons" },
};

export const demoSound = (artistSlug: string): DemoSound | null => DEMO_SOUNDS[artistSlug] ?? null;

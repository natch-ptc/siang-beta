// A photo card background, in the same format the seeded artists use (see
// supabase/migrations/0008_anong_real_art.sql): the photo under a dark
// gradient so the name and location stay readable.
export const PHOTO_CARD_INK = "#FCE7F1";

export const PLAIN_CARD = { card_bg: "#000000", card_ink: "#ffffff", card_tint: "#333333" };

// x/y are the photo's background-position in percent (50/50 = centred), set by
// dragging the photo in the Studio.
export function photoCardBg(url: string, x = 50, y = 50) {
  const pct = (n: number) => `${Math.round(Math.min(100, Math.max(0, n)) * 10) / 10}%`;
  return `linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url("${url}") ${pct(x)} ${pct(y)}/cover no-repeat`;
}

// Reads the position back out of a card background ("center" -> 50/50).
export function photoPosition(cardBg: string): { x: number; y: number } {
  const m = cardBg.match(/url\([^)]*\)\s+(-?[\d.]+)%\s+(-?[\d.]+)%/);
  return m ? { x: +m[1], y: +m[2] } : { x: 50, y: 50 };
}

export function photoFromCardBg(cardBg: string): string | null {
  return cardBg.match(/url\(["']?([^"')]+)["']?\)/)?.[1] ?? null;
}

// Average colour of an image file, as a hex tint for the player and mini
// player (lib/color.ts only uses its hue and saturation). Read from the local
// file before upload, so there is no cross-origin canvas problem.
export async function averageHex(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, 16, 16);
    const { data } = ctx.getImageData(0, 0, 16, 16);
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const n = data.length / 4;
    return "#" + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

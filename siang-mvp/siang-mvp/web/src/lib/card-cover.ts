// A photo card background, in the same format the seeded artists use (see
// supabase/migrations/0008_anong_real_art.sql): the photo under a dark
// gradient so the name and location stay readable.
export const PHOTO_CARD_INK = "#FCE7F1";

export const PLAIN_CARD = { card_bg: "#000000", card_ink: "#ffffff", card_tint: "#333333" };

export function photoCardBg(url: string) {
  return `linear-gradient(180deg, rgba(20,8,14,0.25), rgba(20,8,14,0.82)), url("${url}") center/cover no-repeat`;
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

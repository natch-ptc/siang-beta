import { MARK_D, MARK_H, MARK_W } from "@/components/Logo";
import { formatCode, type ShareInfo } from "./share";

// The printable label for a wall or a table (PRD 6.17): A6 at 300 dpi, laid
// out as in the Draft-1 design — the QR on the left; the title, who made it
// and one line of instruction on the right.
const W = 1748;
const H = 1240;
const PAD = 110;
const QR = 860;
const QR_Y = (H - QR) / 2;
const TEXT_X = PAD + QR + 80;
const TEXT_W = W - TEXT_X - PAD;
const FONT = '"Outfit", "Prompt", "Helvetica Neue", Arial, sans-serif';
const INK = "#0f0f0f";
const SOFT = "#6a6a6a";

// Breaks text into lines that fit. Thai has no spaces between words, so the
// browser's word segmenter finds the break points where it is available.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const pieces =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? [...new Intl.Segmenter(undefined, { granularity: "word" }).segment(text)].map((s) => s.segment)
      : text.split(/(\s+)/);
  const lines: string[] = [];
  let line = "";
  for (const piece of pieces) {
    if (line && ctx.measureText(line + piece).width > maxWidth) {
      lines.push(line.trimEnd());
      line = piece.trimStart();
    } else {
      line += piece;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && ctx.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
  kept[maxLines - 1] = last + "…";
  return kept;
}

// Draws the label onto a new canvas. `qr` is the page's QR code, already
// rendered large (the share sheet keeps one for this).
export async function drawLabel(info: ShareInfo, qr: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  // Canvas text falls back silently if the web fonts have not loaded yet.
  const sample = info.title + info.subtitle;
  await Promise.all(
    ["600 84px Outfit", "400 48px Outfit", "600 84px Prompt", "400 48px Prompt"].map((f) => document.fonts.load(f, sample).catch(() => []))
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = false; // keep the QR's edges crisp when scaled
  ctx.drawImage(qr, PAD, QR_Y, QR, QR);

  ctx.fillStyle = INK;
  ctx.textBaseline = "top";
  let y = QR_Y;

  ctx.font = `600 84px ${FONT}`;
  for (const line of wrap(ctx, info.title, TEXT_W, 3)) {
    ctx.fillText(line, TEXT_X, y);
    y += 104;
  }
  y += 14;
  ctx.font = `400 48px ${FONT}`;
  for (const line of wrap(ctx, info.subtitle, TEXT_W, 1)) {
    ctx.fillText(line, TEXT_X, y);
    y += 64;
  }
  if (info.meta) {
    ctx.fillStyle = SOFT;
    ctx.font = `400 40px ${FONT}`;
    for (const line of wrap(ctx, info.meta, TEXT_W, 2)) {
      ctx.fillText(line, TEXT_X, y + 10);
      y += 54;
    }
  }

  // From the bottom up: the address, the instruction, the work code.
  ctx.textBaseline = "alphabetic";
  const markH = 44;
  let bottom = QR_Y + QR;
  ctx.fillStyle = SOFT;
  ctx.font = `400 32px ${FONT}`;
  ctx.fillText(wrap(ctx, info.qrUrl.replace(/^https?:\/\//, ""), TEXT_W - 150, 1)[0], TEXT_X, bottom);
  bottom -= markH + 22;
  ctx.fillStyle = INK;
  ctx.font = `500 38px ${FONT}`;
  const hint = wrap(ctx, info.code ? `${info.hint}, or type this code at siang.co/w` : info.hint, TEXT_W, 2);
  for (const line of [...hint].reverse()) {
    ctx.fillText(line, TEXT_X, bottom);
    bottom -= 50;
  }
  if (info.code) {
    bottom -= 14;
    ctx.font = `600 104px ${FONT}`;
    ctx.fillText(formatCode(info.code), TEXT_X, bottom);
  }

  // The Siang mark in the bottom right corner.
  const scale = markH / MARK_H;
  ctx.save();
  ctx.translate(W - PAD - MARK_W * scale, QR_Y + QR - markH);
  ctx.scale(scale, scale);
  ctx.fillStyle = INK;
  const d = new Path2D(MARK_D);
  for (let i = 0; i < 3; i++) {
    ctx.fill(d);
    ctx.translate(MARK_W / 3, 0);
  }
  ctx.restore();

  return canvas;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = dataUrl;
  a.click();
}

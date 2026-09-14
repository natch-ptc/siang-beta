// Shared drawing primitives for the generative artwork line-art (artwork-art.ts).
// Ported verbatim from the original mockup: every work is drawn on a 100×141.4
// "A4" sheet using the artist's own two card colours and line motif.
export const SHEET_H = 141.4;
export const CY = 70.7;

export const firstHex = (s: string) => (String(s).match(/#[0-9a-fA-F]{6}/) || ["#000000"])[0];
export const f1 = (n: number) => (+n).toFixed(1);

export function seeded(str: string) {
  let x = 0;
  for (const ch of str) x = (x * 31 + ch.charCodeAt(0)) % 99991;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

const VESSEL = "M44 12h32c0 16 22 24 22 48 0 34-16 58-38 58S22 94 22 60c0-24 22-32 22-48z M30 74h60";
export const vessel = (x: number, y: number, s: number, sw: number) =>
  `<path transform="translate(${f1(x)} ${f1(y)}) scale(${s})" stroke-width="${f1(sw / s)}" d="${VESSEL}"/>`;

const BELL = "M-11 10C-9 8-8 2-8-4c0-5 4-8 8-8s8 3 8 8c0 6 1 12 3 14z M0-12v-4 M0 10v3";
export const bell = (x: number, y: number, s: number, sw: number) =>
  `<path transform="translate(${f1(x)} ${f1(y)}) scale(${s})" stroke-width="${f1(sw / s)}" d="${BELL}"/>`;

// shrink a drawing made at another size about its own centre (ox, oy) into the sheet's centre
export const fit = (ox: number, oy: number, s: number, sw: number, inner: string) =>
  `<g transform="translate(${f1(50 - ox * s)} ${f1(CY - oy * s)}) scale(${s})" stroke-width="${f1(sw / s)}">${inner}</g>`;

export const bars = (hs: number[], mode: "top" | "bottom" | "mid", ref: number, x0: number, x1: number) =>
  hs
    .map((h, i) => {
      const x = x0 + (i * (x1 - x0)) / (hs.length - 1);
      const y = mode === "top" ? ref : mode === "bottom" ? ref - h : ref - h / 2;
      return `M${f1(x)} ${f1(y)}v${f1(h)}`;
    })
    .join("");

export const wave = (y: number, amp: number, cycles: number, x0: number, x1: number, steps = 96) => {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    d += (i ? "L" : "M") + f1(x) + " " + f1(y + amp * Math.sin(((i / steps) * cycles * Math.PI * 2)));
  }
  return d;
};

export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${f1(cx + r * Math.cos((a * Math.PI) / 180))} ${f1(cy + r * Math.sin((a * Math.PI) / 180))}`;
  return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
};

export const pebble = (u: string, cx = 0.3, cy = 0.3) =>
  `<radialGradient id="${u}" cx="${cx}" cy="${cy}" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".24" stop-color="#cfc6bd"/><stop offset=".55" stop-color="#6d635c"/><stop offset=".88" stop-color="#14100e"/><stop offset="1" stop-color="#000"/></radialGradient>`;

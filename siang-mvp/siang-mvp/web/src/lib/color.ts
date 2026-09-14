export function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let H = 0;
  if (d) {
    if (mx === r) H = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) H = (b - r) / d + 2;
    else H = (r - g) / d + 4;
    H *= 60;
  }
  const L = (mx + mn) / 2;
  const S = d ? d / (1 - Math.abs(2 * L - 1)) : 0;
  return [Math.round(H), Math.round(S * 100), Math.round(L * 100)];
}

export function tintPair(hex: string) {
  const [H, S] = hexToHsl(hex);
  return {
    wash: `linear-gradient(180deg, hsl(${H} ${Math.min(S, 58)}% 26%) 0%, #171718 46%, #0B0B0B 100%)`,
    panel: `hsl(${H} ${Math.min(S, 62)}% 24%)`,
    bar: `hsl(${H} ${Math.min(S, 56)}% 30%)`,
  };
}

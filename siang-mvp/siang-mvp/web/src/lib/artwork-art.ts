// Ported from the original mockup's `ART` object: each artist's card motif,
// reduced to a handful of small shapes, redrawn four ways for their four
// (or fewer) works. One work per artist prints in negative (ink as ground).
import { CY, arc, bars, bell, f1, fit, pebble, seeded, vessel, wave } from "./artwork-shapes";

export type ArtBody = string | ((uid: string, seedKey: string) => string);
export type ArtSet = { attrs: string; inv?: number; works: ArtBody[] };

export const ART: Record<string, ArtSet> = {
  // ceramics: the vessel outline from the card
  anong: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"',
    inv: 2,
    works: [
      `<circle cx="50" cy="53" r="1.8" fill="currentColor" stroke="none"/><path d="M28 64h44c0 13-10 21-22 21S28 77 28 64z"/><path d="M44 85v4h12v-4"/>`,
      vessel(19.4, 52.6, 0.3, 2.4) + vessel(53.2, 62, 0.22, 2.4),
      `<path d="M28 58h44c0 15-10 24-22 24S28 73 28 58z"/><path d="M44 82v4h12v-4"/><path d="M58 58l-3 6 4 5-3 6"/>`,
      `<path d="M30 47c6-4 12 4 18 0s12 4 18 0"/><path d="M36 55c5-3 9 3 14 0s9 3 14 0"/>
       <path d="M34 93V78a16 16 0 0 1 32 0v15"/><path d="M26 93h48"/>`,
    ],
  },

  // field recording: the soft pebble of light from the card
  kanit: {
    attrs: "",
    works: [
      (u) => `<defs>${pebble(u)}</defs><rect x="31" y="54.2" width="38" height="33" rx="12" fill="url(#${u})"/>`,
      (u) =>
        `<defs><radialGradient id="${u}"><stop offset="0" stop-color="#fff"/><stop offset=".32" stop-color="#cfc6bd" stop-opacity=".85"/><stop offset="1" stop-color="#6d635c" stop-opacity="0"/></radialGradient></defs>` +
        [
          [28, 77, 4],
          [42, 73, 5.5],
          [58, 69, 4.5],
          [72, 65, 3.5],
        ]
          .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${f1(r * 1.4)}" fill="url(#${u})"/>`)
          .join(""),
      (u) =>
        `<defs>${pebble(u, 0.3, 0.2)}</defs>` +
        Array.from({ length: 7 }, (_, i) => `<rect x="${f1(29 + i * 6.5)}" y="52.7" width="3.6" height="36" rx="1.8" fill="url(#${u})"/>`).join(""),
      (u) => `<defs>${pebble(u, 0.06, 0.4)}</defs><rect x="24" y="67.2" width="52" height="7" rx="3.5" fill="url(#${u})"/>`,
    ],
  },

  // sound sculpture: the waveform of rods
  fieldstatic: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"',
    inv: 2,
    works: [
      `<path d="${bars([5, 9, 15, 24, 34, 27, 18, 11, 5], "mid", CY, 28, 72)}"/>`,
      (() => {
        const hs = [22, 30, 16, 26, 19];
        return `<path d="${bars(hs, "top", 52, 32, 68)}"/><path d="${hs.map((h, i) => `M${32 + i * 9} ${52 + h + 6}v3`).join("")}"/>`;
      })(),
      `<path d="${bars(
        Array.from({ length: 11 }, (_, i) => 8 + 11 * (1 + Math.sin(i * 0.62))),
        "bottom",
        86,
        26,
        74
      )}"/>`,
      `<path d="${bars([0, 0, 0, 4, 0, 0, 0, 10, 0], "mid", CY, 28, 72)}"/>`,
    ],
  },

  // charcoal: loose, single-weight lines
  prawit: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',
    inv: 2,
    works: [
      fit(46.5, 53.5, 0.6, 2, `<path d="M30 90c2-12 1-20-4-30L18 43c-2-5 4-8 7-3l8 14-3-24c-1-6 6-7 7-1l4 23 2-28c0-6 8-6 8 0l-1 28 6-22c2-6 9-4 7 2l-6 26c5-6 11-12 16-10 4 2 2 7-2 11-7 8-11 17-13 31"/>`),
      fit(56, 48.5, 0.58, 2, `<path d="M34 18l10-5v37M34 18v66M34 56h34v28M34 56l10-6h34l-10 6M78 50v28M34 31l10-5M34 43l10-5"/>`),
      `<path d="${Array.from({ length: 7 }, (_, i) => {
        const L = 38 - i * 4.4;
        return `M${30 + i * 6} 88l${f1(L * 0.5)} ${f1(-L * 0.866)}`;
      }).join("")}"/>`,
      `<path d="${[50, 57, 64, 71, 85, 92].map((y, i) => `M${30 + (i % 2) * 3} ${y}c7-2 13 2 20 0s13-2 20 0`).join("")}"/>`,
    ],
  },

  // cyanotype: the dot field from the card
  mai: {
    attrs: 'fill="currentColor"',
    inv: 3,
    works: [
      (u, seedKey) => {
        const r = seeded(seedKey);
        let s = "";
        for (let row = 0; row < 6; row++) for (let c = 0; c < 8; c++) s += `<circle cx="${29 + c * 6}" cy="${f1(55.7 + row * 6)}" r="${f1(0.8 + r() * 1.6)}"/>`;
        return s;
      },
      () => {
        let s = "";
        for (let row = 0; row < 8; row++)
          for (let c = 0; c < 8; c++) {
            const x = 29 + c * 6,
              y = 49.7 + row * 6,
              ry = CY + 10 * Math.sin(x * 0.09 + 0.6);
            const rr = Math.max(0.5, 2.6 - Math.abs(y - ry) * 0.14);
            s += `<circle cx="${x}" cy="${f1(y)}" r="${f1(rr)}" opacity="${f1(Math.min(1, 0.35 + rr / 2.6))}"/>`;
          }
        return s;
      },
      `<path d="M24 55h52" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
       <path d="M36 60h28v24c-5 3-9-2-14 0s-9-2-14 0z"/>`,
      `<path d="M0-17c9 6 11 18 0 34-11-16-9-28 0-34z" transform="translate(37 ${CY}) rotate(-14)" opacity=".38"/>
       <path d="M0-17c9 6 11 18 0 34-11-16-9-28 0-34z" transform="translate(63 ${CY}) rotate(10)"/>`,
    ],
  },

  // weaving: warp and weft from the card, set side by side instead of crossing
  ruth: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"',
    inv: 2,
    works: [
      `<path d="M28 54h44M28 70h44M28 86h44"/>
       <path d="M36 43.5v5M50 43.5v5M64 43.5v5M43 59.5v5M57 59.5v5M36 75.5v5M50 75.5v5M64 75.5v5M43 91.5v5M57 91.5v5"/>`,
      `<path d="${[46, 50, 55, 61, 68, 76, 85, 95].map((y) => `M28 ${y}h44`).join("")}"/>`,
      `<path d="${[
        [38, 5],
        [62, 5],
        [38, 5],
        [62, 5],
        [38, 5],
        [62, 3],
      ]
        .map(([x, n], i) => {
          const y = 50 + Math.floor(i / 2) * 16;
          let d = "";
          for (let k = 0; k < n; k++) d += `M${f1(x - 6.8 + k * 3.4)} ${y}v11`;
          return d;
        })
        .join("")}"/>`,
      `<path d="${[58, 73, 88]
        .map((y, r) => {
          let d = "";
          for (let i = 0; i <= 8; i++) {
            const up = i % 2 ? (r === 1 && i === 5 ? 10 : 6) : 0;
            d += (i ? "L" : "M") + f1(28 + i * 5.5) + " " + (y - up);
          }
          return d;
        })
        .join("")}" stroke-linejoin="round"/>`,
    ],
  },

  // blown glass: the rotated ellipse from the card
  nima: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="2.4"',
    inv: 2,
    works: [
      `<circle cx="36" cy="84" r="10"/><circle cx="58" cy="69" r="7"/><circle cx="72" cy="56" r="4.5"/>`,
      [-14.5, 0, 14.5].map((d) => `<ellipse cx="50" cy="${f1(CY + d)}" rx="20" ry="4" transform="rotate(-14 50 ${f1(CY + d)})"/>`).join(""),
      `<path d="M24 85h52" stroke-linecap="round"/>${[
        [34, 6, 9],
        [50, 5, 12],
        [66, 7, 7],
      ]
        .map(([x, rx, ry]) => `<ellipse cx="${x}" cy="${85 - ry}" rx="${rx}" ry="${ry}"/><path d="M${x} ${85 - 2 * ry}v-5" stroke-linecap="round"/>`)
        .join("")}`,
      `<ellipse cx="50" cy="58" rx="20" ry="8" transform="rotate(-14 50 58)" pathLength="100" stroke-dasharray="17 6 11 6 20 6 10 6 12 6"/>
       <path d="M34 76q4-3 8-1M56 80q4 1 6 5M42 90q3-3 6-2M64 93q2 1 3 4" stroke-linecap="round"/>`,
    ],
  },

  // woodblock: the chevron from the card
  lek: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"',
    inv: 2,
    works: [
      `<path d="M34 64L50 50l16 14"/><path d="M26 74c8-2 14 2 24 0s16-2 24 0M26 82c8-2 14 2 24 0s16-2 24 0M26 90c8-2 14 2 24 0s16-2 24 0" stroke-width="2.2"/>`,
      `<rect x="28" y="52" width="12" height="38" rx="1"/><rect x="46" y="60" width="26" height="12" rx="1"/><rect x="46" y="78" width="18" height="12" rx="1"/>`,
      ["M-6-3L0 3l6-6", "M-6-4q6 12 12 0", "M0-7v14", "", "M-6 5L-2-5M2 5L6-5", "", "M-7 2l3.5-5 3.5 5 3.5-5 3.5 5", "M-7 0h14", "M-5-5l10 10M5-5L-5 5", "M-6 4L0-4l6 8", "M-7-3h14M-7 3h14", "M-6 3q6-10 12 0"]
        .map((d, i) => {
          const x = 30.5 + (i % 4) * 13,
            y = 57.2 + Math.floor(i / 4) * 13.5;
          if (i === 3) return `<circle cx="${x}" cy="${y}" r="1.6" fill="currentColor" stroke="none"/>`;
          if (i === 5) return `<circle cx="${x}" cy="${y}" r="3.3" stroke-width="2.2"/>`;
          return `<path transform="translate(${x} ${y}) scale(.6)" stroke-width="3.7" d="${d}"/>`;
        })
        .join(""),
      `<path d="M32 54L50 66l18-12" opacity=".5"/><path d="M32 88L50 76l18 12"/>`,
    ],
  },

  // light: the sun and rays from the card
  ines: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"',
    inv: 0,
    works: [
      fit(
        50,
        45,
        0.6,
        2.4,
        `<path d="M38 64c-8-6-12-14-12-22a24 24 0 0 1 48 0c0 8-4 16-12 22v10H38z"/><path d="M40 82h20M43 88h14"/>
        <path d="M50 4v6M20 14l4 4M80 14l-4 4M8 40h6M86 40h6"/>`
      ),
      Array.from({ length: 5 }, (_, i) => `<rect x="${f1(25.5 + i * 10.5)}" y="64.7" width="7" height="12" rx="2"${i === 3 ? ' fill="currentColor"' : ""}/>`).join(""),
      `<circle cx="50" cy="${CY}" r="8"/>` +
        Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 - Math.PI / 2,
            L = 8 - i * 0.36,
            r0 = 13;
          return `<path d="M${f1(50 + Math.cos(a) * r0)} ${f1(CY + Math.sin(a) * r0)}L${f1(50 + Math.cos(a) * (r0 + L))} ${f1(CY + Math.sin(a) * (r0 + L))}" opacity="${f1(1 - i * 0.05)}"/>`;
        }).join(""),
      `<path d="${wave(CY, 6, 4, 26, 74)}"/>`,
    ],
  },

  // bronze bells: the bell and the arcs of its sound
  somchai: {
    attrs: 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"',
    inv: 2,
    works: [
      [55.5, 72.5, 89.5]
        .map((y) => [34, 50, 66].map((x) => bell(x, y, 0.5, 2.4)))
        .flat()
        .join(""),
      bell(50, 72.5, 1.35, 2.4) + `<path d="M28 63q-5 8 0 16M21 58q-7 13 0 26M72 63q5 8 0 16M79 58q7 13 0 26"/>`,
      `<circle cx="38" cy="${CY}" r="3" fill="currentColor" stroke="none"/>` +
        [8, 13, 18, 23, 28].map((r, i) => `<path d="${arc(38, CY, r, -40, 40)}" opacity="${f1(1 - i * 0.17)}"/>`).join(""),
      `<path d="M62 42q2-2 4 0q2-2 4 0" stroke-width="1.8"/><path d="M28 69L50 53l22 16" stroke-dasharray="4 4"/>
       <path d="M34 75v20M66 75v20"/>${bell(50, 85, 0.55, 2.4)}`,
    ],
  },
};

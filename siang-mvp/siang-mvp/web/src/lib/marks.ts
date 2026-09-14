// The hand-drawn glyph shown on the face of each artist's card.
// Ported verbatim from the original index.html mockup (const MARKS).
export const MARKS: Record<string, string> = {
  anong: `<svg viewBox="0 0 120 130" width="46%" fill="none" stroke="currentColor" stroke-width="4">
    <path d="M44 12h32c0 16 22 24 22 48 0 34-16 58-38 58S22 94 22 60c0-24 22-32 22-48z"/>
    <path d="M30 74h60M44 12h32"/></svg>`,
  kanit: `<div class="blob"></div>`,
  fieldstatic: `<svg viewBox="0 0 200 80" width="76%" stroke="currentColor" stroke-width="5" stroke-linecap="round">
    <path d="M6 40v0M22 26v28M38 12v56M54 32v16M70 4v72M86 22v36M102 34v12M118 14v52M134 28v24M150 8v64M166 30v20M182 22v36M196 38v4"/></svg>`,
  prawit: `<svg viewBox="0 0 140 100" width="62%" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round">
    <path d="M14 78c22-52 34-64 44-56 8 6-6 34 2 40 10 8 24-26 34-24 8 2 4 22 14 30"/>
    <path d="M20 88c26-48 36-58 46-52M30 92c22-40 32-50 42-46"/></svg>`,
  mai: `<svg viewBox="0 0 120 120" width="50%" fill="currentColor">
    <g>${[0, 1, 2, 3, 4, 5]
      .map((r) =>
        [0, 1, 2, 3, 4, 5]
          .map((c) => `<circle cx="${14 + c * 18}" cy="${14 + r * 18}" r="${6.5 - r * 0.85}" opacity="${1 - r * 0.14}"/>`)
          .join("")
      )
      .join("")}</g></svg>`,
  ruth: `<svg viewBox="0 0 120 100" width="58%" fill="none" stroke="currentColor" stroke-width="5">
    <path d="M12 22h96M12 50h96M12 78h96"/><path d="M28 8v84M60 8v84M92 8v84" stroke-dasharray="12 16"/></svg>`,
  nima: `<svg viewBox="0 0 200 120" width="66%" fill="none" stroke="currentColor" stroke-width="4">
    <ellipse cx="100" cy="60" rx="86" ry="38" transform="rotate(-14 100 60)"/>
    <ellipse cx="100" cy="60" rx="58" ry="26" transform="rotate(-14 100 60)"/>
    <ellipse cx="100" cy="60" rx="28" ry="13" transform="rotate(-14 100 60)"/></svg>`,
  lek: `<svg viewBox="0 0 120 100" width="56%" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
    <path d="M10 78L60 20l50 58M10 56L60 -2l50 58M10 96L60 38l50 58"/></svg>`,
  ines: `<svg viewBox="0 0 120 120" width="52%" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round">
    <path d="M60 6v22M60 92v22M6 60h22M92 60h22M22 22l16 16M82 82l16 16M98 22L82 38M38 82l-16 16"/>
    <circle cx="60" cy="60" r="15"/></svg>`,
  somchai: `<svg viewBox="0 0 130 100" width="58%" fill="none" stroke="currentColor" stroke-width="4.6">
    <path d="M65 92a44 44 0 0 1-44-44 44 44 0 0 1 88 0 44 44 0 0 1-44 44z"/>
    <path d="M65 76a28 28 0 0 1-28-28 28 28 0 0 1 56 0"/><path d="M65 60a12 12 0 0 1-12-12"/></svg>`,
};

import { SHEET_H, firstHex } from "./artwork-shapes";
import { ART } from "./artwork-art";

// Assembles one work's generated line-art: the artist's motif, in their two
// card colours, drawn one of a few ways depending on which work index this
// is. One work per artist prints in negative (ink as ground) for rhythm on a
// shelf of many. Falls back to null when the artist has no drawn motif yet
// (new sign-ups via Studio) — callers should show a plain color tile instead.
export function getArtworkMarkup(markId: string, workIndex: number, cardBg: string, cardInk: string, seedKey: string) {
  const set = ART[markId];
  if (!set) return null;
  const k = Math.max(0, workIndex) % set.works.length;
  const inv = set.inv === k;
  const ground = inv ? cardInk : cardBg;
  const ink = inv ? firstHex(cardBg) : cardInk;
  const uid = `aw-${markId}-${workIndex}`;
  let body = set.works[k];
  if (typeof body === "function") body = body(uid, seedKey);
  return {
    ground,
    ink,
    svg: `<svg viewBox="0 0 100 ${SHEET_H}" preserveAspectRatio="xMidYMid slice" ${set.attrs} aria-hidden="true">${body}</svg>`,
  };
}

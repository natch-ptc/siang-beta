import { showWhenText } from "./format";
import { isCollection, type Artist, type Show, type Work } from "./types";

// What the share sheet and the printable label say about a page. The QR and
// the link are just how a page is shared (PRD rule 2): every page has both.
export type ShareInfo = {
  title: string;
  subtitle: string; // who made it
  meta: string; // "2025 · Oil on canvas", or where and when for a show
  url: string; // the page's own address, what "Copy link" copies
  qrUrl: string; // what the printed QR opens
  code: string | null; // six-digit work code, printed under the QR
  hint: string; // the one line of instruction on the label
  file: string; // base name for downloads
};

const SITE = "https://siang.co";

export const formatCode = (code: string) => (code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code);

export function artistShare(artist: Artist): ShareInfo {
  const url = `${SITE}/${artist.slug}`;
  return {
    title: artist.name,
    subtitle: `@${artist.slug}`,
    meta: [artist.based, artist.country].filter(Boolean).join(", "),
    url,
    qrUrl: url,
    code: null,
    hint: "Scan to see the artist",
    file: `siang-${artist.slug}`,
  };
}

// A work's label carries its code address (siang.co/w/123456): it never
// changes, even if the artist renames the work or their handle.
export function workShare(artist: Artist, work: Work): ShareInfo {
  return {
    title: work.title,
    subtitle: artist.name,
    meta: [work.year, work.medium].filter(Boolean).join(" · "),
    url: `${SITE}/${artist.slug}/${work.id}`,
    qrUrl: `${SITE}/w/${work.code}`,
    code: work.code,
    hint: "Scan to listen",
    file: `siang-${work.code}`,
  };
}

export function showShare(artist: Artist, show: Show): ShareInfo {
  const url = `${SITE}/${artist.slug}/shows/${show.slug}`;
  return {
    title: show.title,
    subtitle: artist.name,
    meta: [show.venue, showWhenText(show)].filter(Boolean).join(" · "),
    url,
    qrUrl: url,
    code: null,
    hint: isCollection(show) ? "Scan to see the collection" : "Scan to see the exhibition",
    file: `siang-${artist.slug}-${show.slug}`,
  };
}

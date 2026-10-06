export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// siang.co/<slug> is the artist's public page, so a slug can't be a path the
// app already uses (app routes, public folders, the old /beta-1.N address).
// The two-letter routes (/me, /w, /s) are shorter than any slug can be.
const RESERVED = new Set([
  "app", "api", "art", "audio", "fonts", "login", "logout", "signup", "studio", "mvp", "demo", "beta",
  "join", "join-beta", "claim-your-link", "admin", "about", "help", "settings", "auth", "www", "siang", "static",
  "artists", "artist", "exhibitions", "exhibition", "places", "place", "shows", "explore", "search", "terms", "privacy",
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 30;

// Returns what's wrong with a proposed slug, or null when it can be used.
export function slugProblem(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `Use at least ${SLUG_MIN} characters.`;
  if (slug.length > SLUG_MAX) return `Keep it under ${SLUG_MAX} characters.`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Use English letters, numbers and single dashes (like anong-ceramics).";
  if (!/[a-z]/.test(slug)) return "Use at least one letter.";
  if (RESERVED.has(slug) || slug.startsWith("beta-")) return "That link is used by Siang itself. Try another.";
  return null;
}

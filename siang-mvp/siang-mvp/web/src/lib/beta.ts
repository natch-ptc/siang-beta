// Siang opens straight on the app (PRD v3, D10), so the old beta address
// (/beta-version-1.0) redirects home; see next.config.ts.
export const BETA_PATH = "/";

// Siang's own artist page (supabase/migrations/0017_siang_official.sql). No
// account owns it. Its works are examples made by the team, so that a new
// artist can see a finished page; they are labelled "Example" wherever they show.
export const OFFICIAL_SLUG = "siang";
export const OFFICIAL_PATH = "/" + OFFICIAL_SLUG;
export const isOfficial = (slug: string) => slug === OFFICIAL_SLUG;

// Exhibitions are built (the Studio form, the Exhibition tab, show pages) but
// held back for now: artists found creating one confusing during sign-up, so
// the app says "Coming soon" until this is switched on. Collections stay open.
export const EXHIBITIONS_OPEN = false;

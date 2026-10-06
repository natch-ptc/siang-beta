// Shape mirrors the tables in supabase/migrations; rows are mapped into it by
// rowToArtist in lib/queries.ts.

export type Work = {
  id: string; // the work's slug, used in its URL (siang.co/<artist>/<id>)
  dbId: string; // artworks.id — what listens are counted against
  code: string; // six-digit work code printed under the work's QR, kept for life
  title: string;
  description: string;
  coverUrl: string | null;
  audioUrl: string | null;
  soundCredit: string | null; // set when the sound is an example for the demo, not the artist's own (lib/demo-sounds.ts)
  durationSec: number;
  listenCount: number;
  createdAt: string; // ISO timestamp, shown as "28 NOV 2025"
  year: number | null;
  medium: string;
  heightCm: number | null;
  widthCm: number | null;
  depthCm: number | null;
  showSlugs: string[]; // the exhibitions and collections this work is in
};

// One row of `exhibitions`. With a venue it is an exhibition (a place and,
// usually, dates); without one it is a collection the artist pulled together.
export type Show = {
  slug: string; // its address: siang.co/<artist>/shows/<slug>
  title: string;
  kind: "solo" | "group";
  year: number | null;
  venue: string;
  city: string;
  geo: string; // Google Maps query: "lat,lng", or the venue's name when there are no coordinates
  coverUrl: string | null;
  startsOn: string | null; // "2026-01-01"
  endsOn: string | null;
  hours: string;
  entry: string;
  workIds: string[]; // Work.id of the works in it, in the artist's order
};

export type Contact = {
  kind: "ig" | "line" | "email" | "web";
  value: string;
};

export type ArtistLink = { label: string; url: string };

export type Artist = {
  id: string;
  slug: string; // the handle: siang.co/<slug>, shown as @slug
  name: string;
  artType: string; // main art type (artists.discipline)
  based: string;
  country: string;
  geo: string;
  bio: string;
  avatarUrl: string | null;
  cardBg: string; // css background of the artist's card
  cardInk: string;
  joinedAt: string; // ISO timestamp
  joinedTz: string | null; // zone the card was made in; joinedAt is shown in it
  totalListens: number;
  contacts: Contact[];
  links: ArtistLink[];
  works: Work[];
  shows: Show[]; // exhibitions and collections together; see isCollection()
};

export const isCollection = (show: Show) => !show.venue;

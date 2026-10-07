// Shape mirrors the tables in supabase/migrations; rows are mapped into it by
// rowToArtist in lib/queries.ts.

export type Availability = "available" | "sold" | "not_for_sale";

export type Work = {
  id: string; // the work's slug, used in its URL (siang.co/<artist>/<id>)
  dbId: string; // artworks.id — what listens are counted against
  code: string; // six-digit work code printed under the work's QR, kept for life
  title: string;
  titleEn: string; // the title in the other language, when the artist gave one
  description: string;
  coverUrl: string | null;
  images: string[]; // more pictures of the work, after the cover
  audioUrl: string | null;
  durationSec: number;
  listenCount: number;
  createdAt: string; // ISO timestamp, shown as "28 NOV 2025"
  year: number | null;
  medium: string;
  sizeText: string; // size as the artist wrote it: "40 x 60 cm", "variable"
  heightCm: number | null;
  widthCm: number | null;
  depthCm: number | null;
  materials: string;
  edition: string;
  credits: string;
  price: string; // an amount, or "Price on request"
  availability: Availability | null;
  locationNow: string; // where the work is now: a venue and city, or the studio
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
  statement: string;
  shopUrl: string;
  avatarUrl: string | null;
  cardBg: string; // css background of the artist's card
  cardInk: string;
  joinedAt: string; // ISO timestamp
  joinedTz: string | null; // zone the card was made in; joinedAt is shown in it
  totalListens: number;
  contacts: Contact[];
  links: ArtistLink[];
  works: Work[]; // published works only
  takenDown: { id: string; title: string }[]; // works taken down: their links still open a simple page
  shows: Show[]; // exhibitions and collections together; see isCollection()
};

export const isCollection = (show: Show) => !show.venue;

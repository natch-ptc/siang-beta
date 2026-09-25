// Shape mirrors the tables in supabase/migrations/0001_init.sql; rows are
// mapped into it by rowToArtistCard in lib/queries.ts.

export type Artwork = {
  id: string;
  code: string; // six-digit code printed under the work's QR — see 0001_init.sql's makeCode()
  title: string;
  durationLabel: string; // "3:12"
  listenCount: number;
  showIndex: number; // which exhibition (index into ArtistCard.shows) this work hung in
  description: string;
  coverUrl: string | null; // artist-uploaded photo; falls back to generated line art when absent
};

export type Exhibition = {
  title: string;
  kind: "Solo" | "Group";
  year: number;
  venue: string;
  geo: string; // "lat,lng"
};

export type Contact = {
  kind: "ig" | "line" | "email" | "web";
  value: string;
};

export type ArtistCard = {
  id: string;
  slug: string;
  name: string;
  based: string;
  country: string;
  addedAt: string; // ISO timestamp
  cardBg: string; // css background (solid, gradient, or radial-gradient)
  cardInk: string;
  tint: string; // accent hex used to tint the player
  markId: string; // key into ART (lib/artwork-art.ts)
  avatarUrl: string | null; // artist-uploaded photo; falls back to the drawn mark when absent
  bio: string;
  geo: string;
  joined: string; // "Feb 2025"
  monthlyListeners: number;
  contacts: Contact[];
  art: Artwork[];
  shows: Exhibition[];
};

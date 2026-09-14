// Shape mirrors the tables in supabase/migrations/0001_init.sql,
// so swapping the mock data source for a real Supabase query is a drop-in change.

export type Artwork = {
  id: string;
  title: string;
  durationLabel: string; // "3:12"
  listenCount: number;
  showIndex: number; // which exhibition (index into ArtistCard.shows) this work hung in
  description: string;
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
  markId: string; // key into MARKS
  bio: string;
  geo: string;
  joined: string; // "Feb 2025"
  monthlyListeners: number;
  contacts: Contact[];
  art: Artwork[];
  shows: Exhibition[];
};

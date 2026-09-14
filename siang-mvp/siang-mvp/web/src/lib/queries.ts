import type { SupabaseClient } from "@supabase/supabase-js";
import { clock } from "./format";
import type { ArtistCard, Artwork, Contact, Exhibition } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthYear(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// MARKS keys happen to be the first slug segment for every seeded artist
// (e.g. "anong-vetchakul" -> "anong"). Falls back to an empty mark for
// artists added later that don't have a hand-drawn glyph yet.
function markIdFromSlug(slug: string) {
  return slug.split("-")[0];
}

type Row = {
  id: string;
  slug: string;
  name: string;
  based: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  bio: string | null;
  card_bg: string | null;
  card_ink: string | null;
  card_tint: string | null;
  avatar_url: string | null;
  joined_at: string | null;
  artist_contacts: { kind: Contact["kind"]; value: string }[];
  exhibitions: {
    id: string;
    title: string;
    kind: "solo" | "group";
    year: number | null;
    venue: string | null;
    lat: number | null;
    lng: number | null;
  }[];
  artworks: {
    id: string;
    slug: string;
    code: string;
    title: string;
    duration_sec: number | null;
    description: string | null;
    cover_url: string | null;
    listen_count: number;
    sort_order: number;
    exhibition_artworks: { exhibition_id: string }[];
  }[];
};

export async function fetchArtists(supabase: SupabaseClient): Promise<ArtistCard[]> {
  const { data, error } = await supabase
    .from("artists")
    .select(
      `
      id, slug, name, based, country, lat, lng, bio, card_bg, card_ink, card_tint, avatar_url, joined_at,
      artist_contacts ( kind, value ),
      exhibitions ( id, title, kind, year, venue, lat, lng ),
      artworks ( id, slug, code, title, duration_sec, description, cover_url, listen_count, sort_order, exhibition_artworks ( exhibition_id ) )
    `
    )
    .order("name");

  if (error) throw error;
  return (data as unknown as Row[]).map(rowToArtistCard);
}

function rowToArtistCard(row: Row): ArtistCard {
  const shows: Exhibition[] = [...row.exhibitions]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .map((sh) => ({
      title: sh.title,
      kind: sh.kind === "solo" ? "Solo" : "Group",
      year: sh.year ?? 0,
      venue: sh.venue ?? "",
      geo: `${sh.lat ?? 0},${sh.lng ?? 0}`,
    }));
  // map from DB exhibition id -> index in the sorted `shows` array above
  const showIndexById = new Map(
    [...row.exhibitions]
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .map((sh, i) => [sh.id, i] as const)
  );

  const art: Artwork[] = [...row.artworks]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((w) => {
      const exhibitionId = w.exhibition_artworks[0]?.exhibition_id;
      return {
        id: w.slug,
        code: w.code,
        title: w.title,
        durationLabel: clock(w.duration_sec ?? 0),
        listenCount: w.listen_count,
        showIndex: exhibitionId ? showIndexById.get(exhibitionId) ?? -1 : -1,
        description: w.description ?? "",
        coverUrl: w.cover_url,
      };
    });

  const contacts: Contact[] = row.artist_contacts.map((c) => ({ kind: c.kind, value: c.value }));
  const monthlyListeners = art.reduce((sum, w) => sum + w.listenCount, 0);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    based: row.based ?? "",
    country: row.country ?? "",
    addedAt: row.joined_at ?? new Date().toISOString(),
    cardBg: row.card_bg ?? "#000000",
    cardInk: row.card_ink ?? "#ffffff",
    tint: row.card_tint ?? "#333333",
    markId: markIdFromSlug(row.slug),
    avatarUrl: row.avatar_url,
    bio: row.bio ?? "",
    geo: `${row.lat ?? 0},${row.lng ?? 0}`,
    joined: monthYear(row.joined_at),
    monthlyListeners,
    contacts,
    art,
    shows,
  };
}

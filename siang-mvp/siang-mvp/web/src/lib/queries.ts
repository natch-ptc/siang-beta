import type { SupabaseClient } from "@supabase/supabase-js";
import { clock } from "./format";
import type { ArtistCard, Artwork, Contact, Exhibition } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthYear(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ART keys happen to be the first slug segment for every seeded artist
// (e.g. "anong-vetchakul" -> "anong"). Falls back to a plain colour tile for
// artists added later that don't have generated art yet.
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
    slug: string;
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
    audio_url: string | null;
    listen_count: number;
    sort_order: number;
    exhibition_artworks: { exhibition_id: string }[];
  }[];
};

const ARTIST_SELECT = `
  id, slug, name, based, country, lat, lng, bio, card_bg, card_ink, card_tint, avatar_url, joined_at,
  artist_contacts ( kind, value ),
  exhibitions ( id, slug, title, kind, year, venue, lat, lng ),
  artworks ( id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order, exhibition_artworks ( exhibition_id ) )
`;

// "examples" are the seeded demo artists (no account owns them); "registered"
// are artists who signed up and built their page in the Studio.
export type ArtistSet = "examples" | "registered";

export async function fetchArtists(supabase: SupabaseClient, set: ArtistSet): Promise<ArtistCard[]> {
  const query = supabase.from("artists").select(ARTIST_SELECT).order("name");
  const { data, error } = await (set === "examples" ? query.is("user_id", null) : query.not("user_id", "is", null));

  if (error) throw error;
  return (data as unknown as Row[]).map(rowToArtistCard);
}

export type ArtistLink = { label: string; url: string };

// One artist for their public page (siang.co/<slug>), with their Linktree-style links.
export async function fetchArtistBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ artist: ArtistCard; links: ArtistLink[] } | null> {
  const { data, error } = await supabase
    .from("artists")
    .select(`${ARTIST_SELECT}, artist_links ( label, url, sort_order )`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as Row & { artist_links: (ArtistLink & { sort_order: number })[] };
  const links = [...row.artist_links].sort((a, b) => a.sort_order - b.sort_order).map(({ label, url }) => ({ label, url }));
  return { artist: rowToArtistCard(row), links };
}

// What the map pills search Google Maps for: exact coordinates when we have
// them, otherwise the place's name (artists and shows added in the Studio
// before it saved coordinates would otherwise land on 0,0).
function geoQuery(lat: number | null, lng: number | null, name: string | null) {
  return lat != null && lng != null ? `${lat},${lng}` : name ?? "";
}

function rowToArtistCard(row: Row): ArtistCard {
  const shows: Exhibition[] = [...row.exhibitions]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .map((sh) => ({
      slug: sh.slug,
      title: sh.title,
      kind: sh.kind === "solo" ? "Solo" : "Group",
      year: sh.year ?? 0,
      venue: sh.venue ?? "",
      geo: geoQuery(sh.lat, sh.lng, sh.venue),
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
        dbId: w.id,
        code: w.code,
        title: w.title,
        durationLabel: clock(w.duration_sec ?? 0),
        listenCount: w.listen_count,
        showIndex: exhibitionId ? showIndexById.get(exhibitionId) ?? -1 : -1,
        description: w.description ?? "",
        coverUrl: w.cover_url,
        audioUrl: w.audio_url,
      };
    });

  const contacts: Contact[] = row.artist_contacts.map((c) => ({ kind: c.kind, value: c.value }));
  const totalListens = art.reduce((sum, w) => sum + w.listenCount, 0);

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
    geo: geoQuery(row.lat, row.lng, [row.based, row.country].filter(Boolean).join(", ")),
    joined: monthYear(row.joined_at),
    totalListens,
    contacts,
    art,
    shows,
  };
}

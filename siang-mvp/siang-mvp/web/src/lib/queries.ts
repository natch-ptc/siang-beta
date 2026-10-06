import type { SupabaseClient } from "@supabase/supabase-js";
import type { Artist, ArtistLink, Contact, Show, Work } from "./types";

type Row = {
  id: string;
  slug: string;
  name: string;
  discipline: string | null;
  based: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  bio: string | null;
  card_bg: string | null;
  card_ink: string | null;
  avatar_url: string | null;
  joined_at: string | null;
  joined_tz: string | null;
  artist_contacts: { kind: Contact["kind"]; value: string }[];
  artist_links: (ArtistLink & { sort_order: number })[];
  exhibitions: {
    id: string;
    slug: string;
    title: string;
    kind: "solo" | "group";
    year: number | null;
    venue: string | null;
    lat: number | null;
    lng: number | null;
    cover_url: string | null;
    starts_on?: string | null;
    ends_on?: string | null;
    city?: string | null;
    hours?: string | null;
    entry?: string | null;
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
    created_at: string;
    year?: number | null;
    medium?: string | null;
    height_cm?: number | null;
    width_cm?: number | null;
    depth_cm?: number | null;
    exhibition_artworks: { exhibition_id: string }[];
  }[];
};

// The columns added by supabase/migrations/0015_v3_fields.sql. Reads ask for
// them first and fall back to the older columns when the database doesn't
// have them yet, so the site stays up if the code is deployed before the
// migration is run.
export const WORK_V3_COLUMNS = "year, medium, height_cm, width_cm, depth_cm";
export const SHOW_V3_COLUMNS = "starts_on, ends_on, city, hours, entry";
const UNDEFINED_COLUMN = "42703";

export async function withV3Fallback<T>(
  run: (v3: boolean) => PromiseLike<{ data: T | null; error: { code?: string; message: string } | null }>
): Promise<T | null> {
  let res = await run(true);
  if (res.error?.code === UNDEFINED_COLUMN) res = await run(false);
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const artistSelect = (v3: boolean) => `
  id, slug, name, discipline, based, country, lat, lng, bio, card_bg, card_ink, avatar_url, joined_at, joined_tz,
  artist_contacts ( kind, value ),
  artist_links ( label, url, sort_order ),
  exhibitions ( id, slug, title, kind, year, venue, lat, lng, cover_url${v3 ? ", " + SHOW_V3_COLUMNS : ""} ),
  artworks ( id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order, created_at${
    v3 ? ", " + WORK_V3_COLUMNS : ""
  }, exhibition_artworks ( exhibition_id ) )
`;

// "examples" are the seeded demo artists (no account owns them); "registered"
// are artists who signed up and built their page in the Studio.
export type ArtistSet = "examples" | "registered";

export async function fetchArtists(supabase: SupabaseClient, set: ArtistSet): Promise<Artist[]> {
  const rows = await withV3Fallback<Row[]>((v3) => {
    const query = supabase.from("artists").select(artistSelect(v3)).order("name");
    return (set === "examples" ? query.is("user_id", null) : query.not("user_id", "is", null)) as unknown as PromiseLike<{
      data: Row[] | null;
      error: { code?: string; message: string } | null;
    }>;
  });
  return (rows ?? []).map(rowToArtist);
}

// One artist for their public page (siang.co/<slug>).
export async function fetchArtistBySlug(supabase: SupabaseClient, slug: string): Promise<Artist | null> {
  const row = await withV3Fallback<Row>(
    (v3) =>
      supabase.from("artists").select(artistSelect(v3)).eq("slug", slug).maybeSingle() as unknown as PromiseLike<{
        data: Row | null;
        error: { code?: string; message: string } | null;
      }>
  );
  return row ? rowToArtist(row) : null;
}

// The signed-in visitor's own artist page, if they have made one. `signedIn`
// tells a visitor with an account but no profile yet from a signed-out one.
export async function fetchOwnSlug(supabase: SupabaseClient): Promise<{ signedIn: boolean; slug: string | null }> {
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { signedIn: false, slug: null };
  const { data } = await supabase.from("artists").select("slug").eq("user_id", userId).maybeSingle<{ slug: string }>();
  return { signedIn: true, slug: data?.slug ?? null };
}

// Where a six-digit work code leads (siang.co/w/123456): the work's own page.
export async function findWorkPathByCode(supabase: SupabaseClient, code: string): Promise<string | null> {
  const { data, error } = await supabase.from("artworks").select("slug, artists ( slug )").eq("code", code).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as unknown as { slug: string; artists: { slug: string } | null } | null;
  return row?.artists ? `/${row.artists.slug}/${row.slug}` : null;
}

// What the map links search Google Maps for: exact coordinates when we have
// them, otherwise the place's name (artists and shows added in the Studio
// before it saved coordinates would otherwise land on 0,0).
function geoQuery(lat: number | null, lng: number | null, name: string | null) {
  return lat != null && lng != null ? `${lat},${lng}` : name ?? "";
}

// Shows made before there was a city field were typed as "Gallery, City".
function cityFromVenue(venue: string | null) {
  const parts = (venue ?? "").split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
}

function rowToArtist(row: Row): Artist {
  const artworks = [...row.artworks].sort((a, b) => a.sort_order - b.sort_order);
  const slugByShowId = new Map(row.exhibitions.map((sh) => [sh.id, sh.slug] as const));

  const works: Work[] = artworks.map((w) => ({
    id: w.slug,
    dbId: w.id,
    code: w.code,
    title: w.title,
    description: w.description ?? "",
    coverUrl: w.cover_url,
    audioUrl: w.audio_url,
    durationSec: w.duration_sec ?? 0,
    listenCount: w.listen_count,
    createdAt: w.created_at,
    year: w.year ?? null,
    medium: w.medium ?? "",
    heightCm: w.height_cm ?? null,
    widthCm: w.width_cm ?? null,
    depthCm: w.depth_cm ?? null,
    showSlugs: w.exhibition_artworks.map((x) => slugByShowId.get(x.exhibition_id)).filter((s): s is string => !!s),
  }));

  // Newest first: by start date when there is one, otherwise by year.
  const sortKey = (sh: Row["exhibitions"][number]) => sh.starts_on ?? `${sh.year ?? 0}-00-00`;
  const shows: Show[] = [...row.exhibitions]
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
    .map((sh) => ({
      slug: sh.slug,
      title: sh.title,
      kind: sh.kind,
      year: sh.year,
      venue: sh.venue ?? "",
      city: sh.city || cityFromVenue(sh.venue) || (sh.venue ? row.based ?? "" : ""),
      geo: geoQuery(sh.lat, sh.lng, sh.venue),
      coverUrl: sh.cover_url,
      startsOn: sh.starts_on ?? null,
      endsOn: sh.ends_on ?? null,
      hours: sh.hours ?? "",
      entry: sh.entry ?? "",
      workIds: works.filter((w) => w.showSlugs.includes(sh.slug)).map((w) => w.id),
    }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    artType: row.discipline ?? "",
    based: row.based ?? "",
    country: row.country ?? "",
    geo: geoQuery(row.lat, row.lng, [row.based, row.country].filter(Boolean).join(", ")),
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url,
    cardBg: row.card_bg ?? "#000000",
    cardInk: row.card_ink ?? "#ffffff",
    joinedAt: row.joined_at ?? new Date().toISOString(),
    joinedTz: row.joined_tz,
    totalListens: works.reduce((sum, w) => sum + w.listenCount, 0),
    contacts: row.artist_contacts.map((c) => ({ kind: c.kind, value: c.value })),
    links: [...row.artist_links].sort((a, b) => a.sort_order - b.sort_order).map(({ label, url }) => ({ label, url })),
    works,
    shows,
  };
}

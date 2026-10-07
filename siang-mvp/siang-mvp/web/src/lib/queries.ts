import type { SupabaseClient } from "@supabase/supabase-js";
import { OFFICIAL_SLUG } from "./beta";
import type { Artist, ArtistLink, Availability, Contact, Show, Work } from "./types";

type WorkRow = {
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
  // 0015
  year?: number | null;
  medium?: string | null;
  height_cm?: number | null;
  width_cm?: number | null;
  depth_cm?: number | null;
  // 0016
  title_en?: string | null;
  size_text?: string | null;
  materials?: string | null;
  edition?: string | null;
  credits?: string | null;
  price?: string | null;
  availability?: Availability | null;
  location_now?: string | null;
  status?: "published" | "taken_down" | "removed";
  exhibition_artworks: { exhibition_id: string }[];
  artwork_blocks: { type: string; media_url: string | null; sort_order: number }[];
};

type Row = {
  id: string;
  user_id: string | null;
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
  statement?: string | null;
  shop_url?: string | null;
  hidden?: boolean;
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
  artworks: WorkRow[];
};

// Reads ask for the columns of the newest migration first and step back to
// older sets when the database doesn't have them yet, so the site stays up if
// the code is deployed before a migration is run. Level 1 adds
// 0015_v3_fields.sql, level 2 adds 0016_beta_checklist.sql.
export type Level = 0 | 1 | 2;
const UNDEFINED_COLUMN = "42703";

export const workColumns = (level: Level) =>
  "id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order, created_at" +
  (level >= 1 ? ", year, medium, height_cm, width_cm, depth_cm" : "") +
  (level >= 2 ? ", title_en, size_text, materials, edition, credits, price, availability, location_now, status, view_count" : "");

export const showColumns = (level: Level) =>
  "id, slug, title, kind, year, venue, cover_url" + (level >= 1 ? ", starts_on, ends_on, city, hours, entry" : "");

export const artistColumns = (level: Level) =>
  "id, slug, name, discipline, based, country, lat, lng, bio, avatar_url, card_bg, card_ink, card_tint, joined_at, joined_tz" +
  (level >= 2 ? ", statement, shop_url, view_count, slug_changed_at, hidden" : "");

type Result<T> = PromiseLike<{ data: T | null; error: { code?: string; message: string } | null }>;

export async function withFallback<T>(run: (level: Level) => unknown): Promise<T | null> {
  for (const level of [2, 1, 0] as Level[]) {
    const res = await (run(level) as Result<T>);
    if (res.error?.code === UNDEFINED_COLUMN && level > 0) continue;
    if (res.error) throw new Error(res.error.message);
    return res.data;
  }
  return null;
}

const artistSelect = (level: Level) => `
  user_id, ${artistColumns(level)},
  artist_contacts ( kind, value ),
  artist_links ( label, url, sort_order ),
  exhibitions ( lat, lng, ${showColumns(level)} ),
  artworks ( ${workColumns(level)}, exhibition_artworks ( exhibition_id ), artwork_blocks ( type, media_url, sort_order ) )
`;

// Everyone on Siang: the artists who signed up and built their page in the
// Studio, and Siang's own page. A row no account owns is not listed otherwise.
export async function fetchArtists(supabase: SupabaseClient): Promise<Artist[]> {
  const rows = await withFallback<Row[]>((level) =>
    supabase.from("artists").select(artistSelect(level)).or(`user_id.not.is.null,slug.eq.${OFFICIAL_SLUG}`).order("name")
  );
  return (rows ?? []).filter((row) => !row.hidden).map(rowToArtist);
}

// One artist for their public page (siang.co/<slug>). A handle that was
// changed still finds its artist: callers compare `artist.slug` with the
// address they were asked for and redirect to the new one.
export async function fetchArtistBySlug(supabase: SupabaseClient, slug: string): Promise<Artist | null> {
  let row = await withFallback<Row>((level) => supabase.from("artists").select(artistSelect(level)).eq("slug", slug).maybeSingle());
  if (!row) {
    // previous_slug arrives with migration 0016; before it, there is nothing to look up.
    const moved = await supabase.from("artists").select("slug").eq("previous_slug", slug).limit(1).maybeSingle<{ slug: string }>();
    const now = moved.data?.slug;
    if (now) row = await withFallback<Row>((level) => supabase.from("artists").select(artistSelect(level)).eq("slug", now).maybeSingle());
  }
  return row && !row.hidden ? rowToArtist(row) : null;
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
// A work that was taken down still has an address (a simple page), so its
// printed code never ends in an error.
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
  const live = artworks.filter((w) => (w.status ?? "published") === "published");
  const slugByShowId = new Map(row.exhibitions.map((sh) => [sh.id, sh.slug] as const));

  const works: Work[] = live.map((w) => ({
    id: w.slug,
    dbId: w.id,
    code: w.code,
    title: w.title,
    titleEn: w.title_en ?? "",
    description: w.description ?? "",
    coverUrl: w.cover_url,
    images: [...(w.artwork_blocks ?? [])]
      .filter((b) => b.type === "image" && b.media_url)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((b) => b.media_url!),
    audioUrl: w.audio_url,
    durationSec: w.duration_sec ?? 0,
    listenCount: w.listen_count,
    createdAt: w.created_at,
    year: w.year ?? null,
    medium: w.medium ?? "",
    sizeText: w.size_text ?? "",
    heightCm: w.height_cm ?? null,
    widthCm: w.width_cm ?? null,
    depthCm: w.depth_cm ?? null,
    materials: w.materials ?? "",
    edition: w.edition ?? "",
    credits: w.credits ?? "",
    price: w.price ?? "",
    availability: w.availability ?? null,
    locationNow: w.location_now ?? "",
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
    statement: row.statement ?? "",
    shopUrl: row.shop_url ?? "",
    avatarUrl: row.avatar_url,
    cardBg: row.card_bg ?? "#000000",
    cardInk: row.card_ink ?? "#ffffff",
    joinedAt: row.joined_at ?? new Date().toISOString(),
    joinedTz: row.joined_tz,
    totalListens: works.reduce((sum, w) => sum + w.listenCount, 0),
    contacts: row.artist_contacts.map((c) => ({ kind: c.kind, value: c.value })),
    links: [...row.artist_links].sort((a, b) => a.sort_order - b.sort_order).map(({ label, url }) => ({ label, url })),
    works,
    takenDown: artworks.filter((w) => (w.status ?? "published") !== "published").map((w) => ({ id: w.slug, title: w.title })),
    shows,
  };
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SHOW_V3_COLUMNS, WORK_V3_COLUMNS, withV3Fallback } from "@/lib/queries";
import StudioClient, { type StudioArtist, type StudioArtwork, type StudioContact, type StudioExhibition, type StudioLink } from "@/components/StudioClient";

type Result<T> = PromiseLike<{ data: T | null; error: { code?: string; message: string } | null }>;

export default async function StudioPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const email = claimsData?.claims?.email as string | undefined;

  if (!userId) redirect("/login");

  const { data: artist } = await supabase
    .from("artists")
    .select("id, slug, name, discipline, based, country, lat, lng, bio, avatar_url, card_bg, card_ink, card_tint, joined_at, joined_tz")
    .eq("user_id", userId)
    .maybeSingle<StudioArtist>();

  let works: StudioArtwork[] = [];
  let contacts: StudioContact[] = [];
  let shows: StudioExhibition[] = [];
  let links: StudioLink[] = [];
  if (artist) {
    // Works and shows ask for the v3 columns and fall back to the older ones
    // on a database where migration 0015 hasn't been run yet.
    const [worksData, contactsRes, showsData, linksRes] = await Promise.all([
      withV3Fallback<StudioArtwork[]>(
        (v3) =>
          supabase
            .from("artworks")
            .select(
              `id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order, created_at${v3 ? ", " + WORK_V3_COLUMNS : ""}`
            )
            .eq("artist_id", artist.id)
            .order("sort_order") as unknown as Result<StudioArtwork[]>
      ),
      supabase.from("artist_contacts").select("kind, value").eq("artist_id", artist.id),
      withV3Fallback<StudioExhibition[]>(
        (v3) =>
          supabase
            .from("exhibitions")
            .select(`id, slug, title, kind, year, venue, cover_url${v3 ? ", " + SHOW_V3_COLUMNS : ""}, exhibition_artworks(artwork_id)`)
            .eq("artist_id", artist.id)
            .order("year", { ascending: false }) as unknown as Result<StudioExhibition[]>
      ),
      supabase.from("artist_links").select("id, label, url, sort_order").eq("artist_id", artist.id).order("sort_order"),
    ]);
    works = worksData ?? [];
    contacts = (contactsRes.data as StudioContact[]) ?? [];
    shows = showsData ?? [];
    links = (linksRes.data as StudioLink[]) ?? [];
  }

  return <StudioClient email={email ?? ""} artist={artist ?? null} works={works} contacts={contacts} shows={shows} links={links} />;
}

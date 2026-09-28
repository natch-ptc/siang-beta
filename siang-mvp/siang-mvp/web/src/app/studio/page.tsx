import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudioClient, { type StudioArtist, type StudioArtwork, type StudioContact, type StudioExhibition, type StudioLink } from "@/components/StudioClient";

export default async function StudioPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const email = claimsData?.claims?.email as string | undefined;

  if (!userId) redirect("/login");

  const { data: artist } = await supabase
    .from("artists")
    .select("id, slug, name, discipline, based, country, bio, avatar_url, card_bg, card_ink, card_tint, joined_at")
    .eq("user_id", userId)
    .maybeSingle<StudioArtist>();

  let works: StudioArtwork[] = [];
  let contacts: StudioContact[] = [];
  let shows: StudioExhibition[] = [];
  let links: StudioLink[] = [];
  if (artist) {
    const [worksRes, contactsRes, showsRes, linksRes] = await Promise.all([
      supabase
        .from("artworks")
        .select("id, slug, code, title, duration_sec, description, cover_url, audio_url, listen_count, sort_order")
        .eq("artist_id", artist.id)
        .order("sort_order"),
      supabase.from("artist_contacts").select("kind, value").eq("artist_id", artist.id),
      supabase
        .from("exhibitions")
        .select("id, title, kind, year, venue, cover_url, exhibition_artworks(artwork_id)")
        .eq("artist_id", artist.id)
        .order("year", { ascending: false }),
      supabase.from("artist_links").select("id, label, url, sort_order").eq("artist_id", artist.id).order("sort_order"),
    ]);
    works = (worksRes.data as StudioArtwork[]) ?? [];
    contacts = (contactsRes.data as StudioContact[]) ?? [];
    shows = (showsRes.data as unknown as StudioExhibition[]) ?? [];
    links = (linksRes.data as StudioLink[]) ?? [];
  }

  return <StudioClient email={email ?? ""} artist={artist ?? null} works={works} contacts={contacts} shows={shows} links={links} />;
}

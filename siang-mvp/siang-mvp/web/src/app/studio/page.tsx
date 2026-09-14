import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudioClient, { type StudioArtist, type StudioArtwork } from "@/components/StudioClient";

export default async function StudioPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const email = claimsData?.claims?.email as string | undefined;

  if (!userId) redirect("/login");

  const { data: artist } = await supabase
    .from("artists")
    .select("id, slug, name, discipline, based, country, bio, avatar_url")
    .eq("user_id", userId)
    .maybeSingle<StudioArtist>();

  let works: StudioArtwork[] = [];
  if (artist) {
    const { data } = await supabase
      .from("artworks")
      .select("id, title, duration_sec, description, cover_url, listen_count, sort_order")
      .eq("artist_id", artist.id)
      .order("sort_order");
    works = (data as StudioArtwork[]) ?? [];
  }

  return <StudioClient email={email ?? ""} artist={artist ?? null} works={works} />;
}

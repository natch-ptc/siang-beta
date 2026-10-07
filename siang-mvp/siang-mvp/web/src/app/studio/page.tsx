import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { artistColumns, showColumns, withFallback, workColumns } from "@/lib/queries";
import StudioClient, { type WelcomeStep, type StudioArtist, type StudioArtwork, type StudioContact, type StudioExhibition, type StudioLink } from "@/components/StudioClient";

const STEPS: WelcomeStep[] = ["ready", "tour"];

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ welcome?: string | string[] }> }) {
  const { welcome } = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const email = claimsData?.claims?.email as string | undefined;
  // Name and Instagram given at sign up (LoginClient), to fill the first onboarding step.
  const meta = (claimsData?.claims?.user_metadata ?? {}) as { name?: string; instagram?: string };

  if (!userId) redirect("/login");

  // Reads ask for the newest migration's columns and step back to older sets
  // on a database where it hasn't been run yet (see lib/queries.ts).
  const artist = await withFallback<StudioArtist>((level) => supabase.from("artists").select(artistColumns(level)).eq("user_id", userId).maybeSingle());

  let works: StudioArtwork[] = [];
  let contacts: StudioContact[] = [];
  let shows: StudioExhibition[] = [];
  let links: StudioLink[] = [];
  if (artist) {
    const [worksData, contactsRes, showsData, linksRes] = await Promise.all([
      withFallback<StudioArtwork[]>((level) =>
        supabase
          .from("artworks")
          .select(workColumns(level) + ", artwork_blocks(id, type, media_url, sort_order)")
          .eq("artist_id", artist.id)
          .order("sort_order")
      ),
      supabase.from("artist_contacts").select("kind, value").eq("artist_id", artist.id),
      withFallback<StudioExhibition[]>((level) =>
        supabase
          .from("exhibitions")
          .select(showColumns(level) + ", exhibition_artworks(artwork_id)")
          .eq("artist_id", artist.id)
          .order("year", { ascending: false })
      ),
      supabase.from("artist_links").select("id, label, url, sort_order").eq("artist_id", artist.id).order("sort_order"),
    ]);
    works = worksData ?? [];
    contacts = (contactsRes.data as StudioContact[]) ?? [];
    shows = showsData ?? [];
    links = (linksRes.data as StudioLink[]) ?? [];
  }

  return (
    <StudioClient
      email={email ?? ""}
      suggestedName={meta.name ?? ""}
      instagram={meta.instagram ?? ""}
      welcome={STEPS.find((s) => s === welcome) ?? null}
      artist={artist ?? null} works={works} contacts={contacts}
      shows={shows}
      links={links}
    />
  );
}

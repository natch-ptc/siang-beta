import HomeClient from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";
import { fetchArtists, type ArtistSet } from "@/lib/queries";
import type { ArtistCard } from "@/lib/types";

// The Pocket app, loaded with either the example artists (/demo) or the
// artists who registered (the live beta).
export default async function PocketPage({ set }: { set: ArtistSet }) {
  const supabase = await createClient();
  let cards: ArtistCard[] | null = null;
  try {
    cards = await fetchArtists(supabase, set);
  } catch (error) {
    // Show the failure instead of quietly serving stale data, so a broken
    // database connection is noticed rather than hidden.
    console.error("fetchArtists failed", error);
  }

  if (!cards) {
    return (
      <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <p>Couldn&apos;t load the artist cards. Please refresh in a moment.</p>
      </main>
    );
  }
  return <HomeClient cards={cards} mode={set === "examples" ? "demo" : "live"} />;
}

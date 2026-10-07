import { createClient } from "@/lib/supabase/server";
import { fetchArtists } from "@/lib/queries";
import { todayInThailand } from "@/lib/format";
import type { Artist } from "@/lib/types";
import ArtistsScreen from "./ArtistsScreen";
import ExhibitionsScreen from "./ExhibitionsScreen";
import ExploreScreen from "./ExploreScreen";
import PageTransition from "./PageTransition";
import styles from "./app.module.css";

// One of the three tabs, filled with everyone on Siang.
export default async function TabPage({ tab }: { tab: "art" | "exhibitions" | "artists" }) {
  const supabase = await createClient();
  let artists: Artist[] | null = null;
  try {
    artists = await fetchArtists(supabase);
  } catch (error) {
    // Show the failure instead of quietly serving nothing, so a broken
    // database connection is noticed rather than hidden.
    console.error("fetchArtists failed", error);
  }

  return (
    <main className={styles.app}>
      <PageTransition>
      {!artists ? (
        <div className={styles.empty}>
          <h2>Couldn&apos;t load Siang</h2>
          <p>Please refresh in a moment.</p>
        </div>
      ) : tab === "art" ? (
        <ExploreScreen artists={artists} />
      ) : tab === "exhibitions" ? (
        <ExhibitionsScreen artists={artists} today={todayInThailand()} />
      ) : (
        <ArtistsScreen artists={artists} />
      )}
      </PageTransition>
    </main>
  );
}

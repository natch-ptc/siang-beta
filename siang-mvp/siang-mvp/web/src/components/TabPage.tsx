import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchArtists, type ArtistSet } from "@/lib/queries";
import { todayInThailand } from "@/lib/format";
import type { Artist } from "@/lib/types";
import ArtistsScreen from "./ArtistsScreen";
import ExhibitionsScreen from "./ExhibitionsScreen";
import ExploreScreen from "./ExploreScreen";
import PageTransition from "./PageTransition";
import styles from "./app.module.css";

// One of the three tabs, filled with the artists who registered (the live
// app) or with the example artists (siang.co/demo).
export default async function TabPage({ tab, set }: { tab: "art" | "exhibitions" | "artists"; set: ArtistSet }) {
  const base = set === "examples" ? "/demo" : "";
  const supabase = await createClient();
  let artists: Artist[] | null = null;
  try {
    artists = await fetchArtists(supabase, set);
  } catch (error) {
    // Show the failure instead of quietly serving nothing, so a broken
    // database connection is noticed rather than hidden.
    console.error("fetchArtists failed", error);
  }

  return (
    <main className={styles.app}>
      <PageTransition>
      {base && (
        // The demo leads somewhere: anyone looking at the example artists can make their own page.
        <Link href="/join" className={styles.demoBar}>
          <span>
            <b>These are example artists.</b> Make a page like this for your own work.
          </span>
          <span className={styles.demoBarCta}>Join the beta</span>
        </Link>
      )}
      {!artists ? (
        <div className={styles.empty}>
          <h2>Couldn&apos;t load Siang</h2>
          <p>Please refresh in a moment.</p>
        </div>
      ) : tab === "art" ? (
        <ExploreScreen artists={artists} base={base} />
      ) : tab === "exhibitions" ? (
        <ExhibitionsScreen artists={artists} today={todayInThailand()} base={base} />
      ) : (
        <ArtistsScreen artists={artists} base={base} />
      )}
      </PageTransition>
    </main>
  );
}

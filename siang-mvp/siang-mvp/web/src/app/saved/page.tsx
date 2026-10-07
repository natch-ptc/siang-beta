import type { Metadata } from "next";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SavedLists from "@/components/SavedLists";
import { createClient } from "@/lib/supabase/server";
import { fetchArtists } from "@/lib/queries";
import type { Artist } from "@/lib/types";
import { BACK_CHEVRON_SVG } from "@/lib/icons";
import app from "@/components/app.module.css";
import styles from "@/components/Profile.module.css";

export const metadata: Metadata = { title: "Saved · Siang.co" };

// siang.co/saved: the works this visitor saved, the ones they saw in person,
// and the artists they follow. Where the Save button's "View" leads, and
// reachable from the Profile tab, for artists and visitors alike.
export default async function SavedPage() {
  const supabase = await createClient();
  let artists: Artist[] = [];
  try {
    artists = await fetchArtists(supabase);
  } catch (error) {
    console.error("fetchArtists failed", error);
  }
  return (
    <main className={app.app}>
      <PageTransition>
        <header className={app.top}>
          <Link href="/me" className={app.iconBtn} aria-label="Back to Profile" style={{ marginLeft: -12 }}>
            {BACK_CHEVRON_SVG}
          </Link>
        </header>
        <h1 className={styles.heading} style={{ paddingTop: 4 }}>
          Your list
        </h1>
        <p className={styles.lead}>Works you saved and saw in person, and artists you follow. Kept on this device.</p>
        <SavedLists artists={artists} emptyHint note={false} />
      </PageTransition>
    </main>
  );
}

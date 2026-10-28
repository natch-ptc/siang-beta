"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { OFFICIAL_PATH } from "@/lib/beta";
import { PIN_CHIP } from "@/lib/icons";
import type { Artist } from "@/lib/types";
import AppHeader, { matches } from "./AppHeader";
import { WorkCard } from "./cards";
import styles from "./app.module.css";

// The Art tab: every published work, newest first, filtered by the city the
// artist is based in.
export default function ExploreScreen({ artists }: { artists: Artist[] }) {
  const [city, setCity] = useState<string | null>(null);
  const [swapped, setSwapped] = useState(false); // a filter was picked, so the cards animate in
  const pick = (c: string | null) => {
    setCity(c);
    setSwapped(true);
  };
  const [query, setQuery] = useState("");

  const all = useMemo(
    () =>
      artists
        .flatMap((artist) => artist.works.map((work) => ({ artist, work })))
        .sort((a, b) => b.work.createdAt.localeCompare(a.work.createdAt)),
    [artists]
  );
  // Cities with the most works first, so the common ones sit at the left of the row.
  const cities = useMemo(() => {
    const count = new Map<string, number>();
    for (const x of all) if (x.artist.based) count.set(x.artist.based, (count.get(x.artist.based) ?? 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([city]) => city);
  }, [all]);
  const shown = all.filter(
    (x) => (!city || x.artist.based === city) && matches(query, x.work.title, x.work.medium, x.artist.name, x.artist.slug, x.artist.artType)
  );

  return (
    <>
      <AppHeader query={query} onQuery={setQuery} placeholder="Search works and artists" />
      {cities.length > 1 && (
        <div className={styles.chips} role="group" aria-label="City">
          <button className={`${styles.chip} ${city === null ? styles.chipOn : ""}`} onClick={() => pick(null)} aria-pressed={city === null} type="button">
            {PIN_CHIP} All cities
          </button>
          {cities.map((c) => (
            <button key={c} className={`${styles.chip} ${city === c ? styles.chipOn : ""}`} onClick={() => pick(c)} aria-pressed={city === c} type="button">
              {PIN_CHIP} {c}
            </button>
          ))}
        </div>
      )}

      {shown.length > 0 ? (
        <div key={city ?? "all"} className={`${styles.grid} ${swapped ? styles.gridSwap : ""}`}>
          {shown.map(({ artist, work }) => (
            <WorkCard key={work.dbId} artist={artist} work={work} />
          ))}
        </div>
      ) : all.length > 0 ? (
        <div className={styles.empty}>
          <h2>Nothing matches</h2>
          <p>Try another word, or look through all the works.</p>
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>No works here yet</h2>
          <p>Be the first: make your artist profile and publish a work with its sound.</p>
          <div className={styles.emptyActs}>
            <Link href="/join" className={styles.btn}>
              Create your profile
            </Link>
            <Link href={OFFICIAL_PATH} className={styles.btnGhost}>
              See an example
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

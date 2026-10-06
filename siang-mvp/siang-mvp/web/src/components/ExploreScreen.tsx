"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ART_TYPES, artTypeOf, type ArtType } from "@/lib/art-types";
import { ALL_CHIP, ART_TYPE_ICON } from "@/lib/icons";
import type { Artist } from "@/lib/types";
import AppHeader, { matches } from "./AppHeader";
import { WorkCard } from "./cards";
import styles from "./app.module.css";

// The Art tab ("Exploring"): every published work, newest first, filtered by
// the artist's main art type.
export default function ExploreScreen({ artists, base = "" }: { artists: Artist[]; base?: string }) {
  const [type, setType] = useState<ArtType | null>(null);
  const [query, setQuery] = useState("");

  const all = useMemo(
    () =>
      artists
        .flatMap((artist) => artist.works.map((work) => ({ artist, work, type: artTypeOf(artist.artType) })))
        .sort((a, b) => b.work.createdAt.localeCompare(a.work.createdAt)),
    [artists]
  );
  const types = ART_TYPES.filter((t) => all.some((x) => x.type === t));
  const shown = all.filter(
    (x) => (!type || x.type === type) && matches(query, x.work.title, x.work.medium, x.artist.name, x.artist.slug, x.artist.artType)
  );

  return (
    <>
      <AppHeader base={base} query={query} onQuery={setQuery} placeholder="Search works and artists" />
      {types.length > 1 && (
        <div className={styles.chips} role="group" aria-label="Art type">
          <button className={`${styles.chip} ${type === null ? styles.chipOn : ""}`} onClick={() => setType(null)} aria-pressed={type === null} type="button">
            {ALL_CHIP} All
          </button>
          {types.map((t) => (
            <button key={t} className={`${styles.chip} ${type === t ? styles.chipOn : ""}`} onClick={() => setType(t)} aria-pressed={type === t} type="button">
              {ART_TYPE_ICON[t]} {t}
            </button>
          ))}
        </div>
      )}

      {shown.length > 0 ? (
        <div className={styles.grid}>
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
            {!base && (
              <Link href="/demo" className={styles.btnGhost}>
                See the demo
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

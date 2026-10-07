"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HOT_CHIP, LEGEND_CHIP, NEW_ARTIST_CHIP } from "@/lib/icons";
import { isCollection, type Artist } from "@/lib/types";
import AppHeader, { matches } from "./AppHeader";
import { Avatar, StripTile } from "./cards";
import FollowButton from "./FollowButton";
import { FORWARD } from "./PageTransition";
import styles from "./app.module.css";

type Sort = "hot" | "new" | "legend";

const SORTS: { id: Sort; label: string; icon: React.ReactNode }[] = [
  { id: "hot", label: "Hot", icon: HOT_CHIP },
  { id: "new", label: "New Artist", icon: NEW_ARTIST_CHIP },
  { id: "legend", label: "Legend", icon: LEGEND_CHIP },
];

const exhibitionCount = (a: Artist) => a.shows.filter((s) => !isCollection(s)).length;

// Hot: most listened to. New Artist: joined most recently. Legend: has shown
// in the most exhibitions. The numbers behind the order are never displayed
// (PRD rule 11: no follower race).
const COMPARE: Record<Sort, (a: Artist, b: Artist) => number> = {
  hot: (a, b) => b.totalListens - a.totalListens || b.works.length - a.works.length,
  new: (a, b) => b.joinedAt.localeCompare(a.joinedAt),
  legend: (a, b) => exhibitionCount(b) - exhibitionCount(a) || b.works.length - a.works.length,
};

// The Artist tab ("Hot Artist!"): each artist with a strip of their works.
export default function ArtistsScreen({ artists }: { artists: Artist[] }) {
  const [sort, setSort] = useState<Sort>("hot");
  const [query, setQuery] = useState("");

  const shown = useMemo(
    () => artists.filter((a) => matches(query, a.name, a.slug, a.artType, a.based)).sort(COMPARE[sort]),
    [artists, query, sort]
  );

  return (
    <>
      <AppHeader query={query} onQuery={setQuery} placeholder="Search artists" />
      <div className={styles.chips} role="group" aria-label="Order">
        {SORTS.map((s) => (
          <button key={s.id} className={`${styles.chip} ${sort === s.id ? styles.chipOn : ""}`} onClick={() => setSort(s.id)} aria-pressed={sort === s.id} type="button">
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {shown.length > 0 ? (
        <div className={styles.artists}>
          {shown.map((artist) => (
            <section key={artist.slug} aria-label={artist.name}>
              <div className={styles.artistHead}>
                <Link href={`/${artist.slug}`} className={styles.artistWho} transitionTypes={FORWARD}>
                  <Avatar artist={artist} size={36} />
                  <span className={styles.byText}>
                    <span className={styles.byName}>{artist.name}</span>
                    <span className={styles.byHandle}>@{artist.slug}</span>
                  </span>
                </Link>
                <FollowButton slug={artist.slug} name={artist.name} />
              </div>
              {artist.works.length > 0 && (
                <div className={styles.strip}>
                  {artist.works.slice(0, 8).map((work) => (
                    <StripTile key={work.dbId} artist={artist} work={work} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>{query ? "Nothing matches" : "No artists here yet"}</h2>
          <p>{query ? "Try another name." : "Artists appear here when they make their profile."}</p>
          {!query && (
            <div className={styles.emptyActs}>
              <Link href="/join" className={styles.btn}>
                Create your profile
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

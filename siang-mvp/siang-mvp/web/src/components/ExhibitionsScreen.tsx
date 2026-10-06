"use client";

import { useMemo, useState } from "react";
import { showTiming, type ShowTiming } from "@/lib/format";
import { ART_CHIP, PIN_CHIP } from "@/lib/icons";
import { isCollection, type Artist } from "@/lib/types";
import AppHeader, { matches } from "./AppHeader";
import { ShowCard } from "./cards";
import styles from "./app.module.css";

// What is on now comes first, closing soonest first (PRD 6.1); then what
// opens next; then shows with no dates; shows that ended go last.
const ORDER: Record<ShowTiming, number> = { now: 0, upcoming: 1, undated: 2, past: 3 };

// The Place tab ("Exhibition"): exhibitions around Thailand, by city.
export default function ExhibitionsScreen({ artists, today, base = "" }: { artists: Artist[]; today: string; base?: string }) {
  const [city, setCity] = useState<string | null>(null); // null = Now Showing
  const [query, setQuery] = useState("");

  const all = useMemo(
    () =>
      artists
        .flatMap((artist) =>
          artist.shows.filter((show) => !isCollection(show)).map((show) => ({ artist, show, timing: showTiming(show, today) }))
        )
        .sort((a, b) => {
          if (a.timing !== b.timing) return ORDER[a.timing] - ORDER[b.timing];
          if (a.timing === "now") return (a.show.endsOn ?? "9999").localeCompare(b.show.endsOn ?? "9999");
          if (a.timing === "upcoming") return (a.show.startsOn ?? "").localeCompare(b.show.startsOn ?? "");
          return (b.show.endsOn ?? String(b.show.year ?? 0)).localeCompare(a.show.endsOn ?? String(a.show.year ?? 0));
        }),
    [artists, today]
  );

  // The cities with the most shows get a chip each.
  const cities = useMemo(() => {
    const count = new Map<string, number>();
    for (const { show } of all) if (show.city) count.set(show.city, (count.get(show.city) ?? 0) + 1);
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([name]) => name);
  }, [all]);

  const shown = all.filter(
    (x) =>
      (city ? x.show.city === city : x.timing !== "past") &&
      matches(query, x.show.title, x.show.venue, x.show.city, x.artist.name, x.artist.slug)
  );

  return (
    <>
      <AppHeader base={base} query={query} onQuery={setQuery} placeholder="Search exhibitions and places" />
      <div className={styles.chips} role="group" aria-label="Where">
        <button className={`${styles.chip} ${city === null ? styles.chipOn : ""}`} onClick={() => setCity(null)} aria-pressed={city === null} type="button">
          {ART_CHIP} Now Showing
        </button>
        {cities.map((c) => (
          <button key={c} className={`${styles.chip} ${city === c ? styles.chipOn : ""}`} onClick={() => setCity(c)} aria-pressed={city === c} type="button">
            {PIN_CHIP} {c}
          </button>
        ))}
      </div>

      {shown.length > 0 ? (
        <div className={styles.list}>
          {shown.map(({ artist, show }) => (
            <ShowCard key={artist.slug + "/" + show.slug} artist={artist} show={show} today={today} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>{query ? "Nothing matches" : city ? `No exhibitions in ${city}` : "Nothing showing right now"}</h2>
          <p>{query ? "Try another word." : all.length > 0 ? "Pick a city to see exhibitions that have ended." : "Exhibitions appear here when artists add them."}</p>
        </div>
      )}
    </>
  );
}

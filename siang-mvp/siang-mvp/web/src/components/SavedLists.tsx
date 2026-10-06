"use client";

import Link from "next/link";
import { useDeviceList } from "@/lib/device";
import type { Artist, Work } from "@/lib/types";
import { Avatar } from "./cards";
import styles from "./Profile.module.css";

type Entry = { artist: Artist; work: Work; note: string };

// Entries are "artist/work", with "|2026-10-06" after it for the day a work was seen.
function resolve(items: string[], artists: Artist[]): Entry[] {
  const found: Entry[] = [];
  for (const item of [...items].reverse()) {
    const [path, date] = item.split("|");
    const [slug, id] = path.split("/");
    const artist = artists.find((a) => a.slug === slug);
    const work = artist?.works.find((w) => w.id === id);
    if (artist && work) found.push({ artist, work, note: date ? `${artist.name} · seen ${date}` : artist.name });
  }
  return found;
}

function WorkRows({ title, entries }: { title: string; entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <section>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.rows}>
        {entries.map(({ artist, work, note }) => (
          <Link key={artist.slug + "/" + work.id} href={`/${artist.slug}/${work.id}`} className={styles.row}>
            <span className={styles.rowImg} style={{ background: work.coverUrl ? `center/cover no-repeat url("${work.coverUrl}")` : artist.cardBg }} />
            <span className={styles.rowText}>
              <b>{work.title}</b>
              <span>{note}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// What this visitor saved, saw in person and follows. Kept on the device
// (lib/device.ts), shown on the Profile tab and at siang.co/saved.
export default function SavedLists({ artists, emptyHint = false, note = true }: { artists: Artist[]; emptyHint?: boolean; note?: boolean }) {
  const saved = resolve(useDeviceList("saved").items, artists);
  const seen = resolve(useDeviceList("seen").items, artists);
  const follows = useDeviceList("follows").items;
  const following = artists.filter((a) => follows.includes(a.slug));
  const nothing = saved.length === 0 && seen.length === 0 && following.length === 0;

  if (nothing) {
    return emptyHint ? (
      <p className={styles.none}>
        Nothing saved yet. Tap Save on a work to keep it here, and Follow on an artist to find them again.
      </p>
    ) : null;
  }
  return (
    <>
      <WorkRows title="Saved" entries={saved} />
      <WorkRows title="Seen in person" entries={seen} />
      {following.length > 0 && (
        <section>
          <h2 className={styles.heading}>Following</h2>
          <div className={styles.rows}>
            {following.map((a) => (
              <Link key={a.slug} href={`/${a.slug}`} className={styles.row}>
                <Avatar artist={a} size={48} />
                <span className={styles.rowText}>
                  <b>{a.name}</b>
                  <span>@{a.slug}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {note && <p className={styles.lead}>These lists are kept on this device.</p>}
    </>
  );
}

"use client";

import Link from "next/link";
import { CalendarDots, PaintBrushBroad, UserPlus, Waveform } from "@phosphor-icons/react/dist/ssr";
import { useDeviceList } from "@/lib/device";
import type { Artist, Work } from "@/lib/types";
import { Avatar } from "./cards";
import Logo, { Mark } from "./Logo";
import app from "./app.module.css";
import styles from "./Profile.module.css";

const STEPS = [
  { label: "Create profile", icon: <UserPlus size={40} weight="bold" /> },
  { label: "Upload your art", icon: <PaintBrushBroad size={40} weight="bold" /> },
  { label: "Create your exhibition", icon: <CalendarDots size={40} weight="bold" /> },
  { label: "Create your Siang", icon: <Waveform size={40} weight="bold" /> },
];

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

// The Profile tab for someone who is not signed in: the four steps to an
// artist profile (Draft-1), and the lists this device keeps for them.
export default function GuestProfile({ artists }: { artists: Artist[] }) {
  const saved = resolve(useDeviceList("saved").items, artists);
  const seen = resolve(useDeviceList("seen").items, artists);
  const follows = useDeviceList("follows").items;
  const following = artists.filter((a) => follows.includes(a.slug));

  return (
    <>
      <header className={app.top}>
        <Link href="/" className={app.logoLink}>
          <Logo height={30} />
        </Link>
      </header>

      <h1 className={styles.heading}>
        <Mark height={17} /> Create your “artist” profile
      </h1>
      <p className={styles.lead}>Your works, your exhibitions and your own voice telling the story behind each piece. One link, one QR label.</p>
      <div className={styles.steps}>
        {STEPS.map((s) => (
          <div key={s.label} className={styles.step}>
            <span className={styles.stepArt}>{s.icon}</span>
            {s.label}
          </div>
        ))}
      </div>
      <div className={styles.cta}>
        <Link href="/join" className={app.btn}>
          Create your profile
        </Link>
        <Link href="/login" className={app.btnGhost}>
          Sign in
        </Link>
      </div>

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
      {(saved.length > 0 || seen.length > 0 || following.length > 0) && <p className={styles.lead}>These lists are kept on this device.</p>}
    </>
  );
}

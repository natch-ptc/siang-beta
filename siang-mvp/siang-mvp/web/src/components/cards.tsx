import Link from "next/link";
import { dayMonthYear, daysLeft, showTiming, showWhenText } from "@/lib/format";
import { CALENDAR_SM, PIN_SM } from "@/lib/icons";
import type { Artist, Show, Work } from "@/lib/types";
import SoundBadge from "./SoundBadge";
import styles from "./app.module.css";

// The cards the tabs and profiles are built from. No state of their own, so
// they render on the server or inside a client screen alike.

// A profile photo, or the mark Siang generates for an artist without one:
// their first letter on a colour drawn from their handle, so it is always
// the same for them.
export function Avatar({ artist, size }: { artist: Pick<Artist, "avatarUrl" | "name" | "slug">; size: number }) {
  if (artist.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.avatar} src={artist.avatarUrl} alt="" width={size} height={size} style={{ width: size, height: size }} />;
  }
  let hash = 0;
  for (const ch of artist.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return (
    <span
      className={styles.mark}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.44,
        background: "linear-gradient(150deg, hsl(" + hue + " 58% 46%), hsl(" + ((hue + 40) % 360) + " 62% 30%))",
      }}
    >
      {[...artist.name.trim()][0]?.toUpperCase() ?? ""}
    </span>
  );
}

export function Byline({ artist, size = 24 }: { artist: Artist; size?: number }) {
  return (
    <span className={styles.by}>
      <Avatar artist={artist} size={size} />
      <span className={styles.byText}>
        <span className={styles.byName}>{artist.name}</span>
        <span className={styles.byHandle}>@{artist.slug}</span>
      </span>
    </span>
  );
}

// A work without a photo shows the artist's card colours instead.
export function Picture({ src, fallback, className }: { src: string | null; fallback: string; className: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} alt="" loading="lazy" decoding="async" />
  ) : (
    <span className={className} style={{ background: fallback }} />
  );
}

export const workTrack = (work: Work) => (work.audioUrl ? { id: work.dbId, url: work.audioUrl, durationSec: work.durationSec } : null);

// Exploring: the picture, who made it, its title in quotes, and its sound.
export function WorkCard({ artist, work }: { artist: Artist; work: Work }) {
  const track = workTrack(work);
  return (
    <article className={`${styles.card} ${styles.shade}`}>
      <Picture className={styles.cardImg} src={work.coverUrl} fallback={artist.cardBg} />
      <Byline artist={artist} />
      <h2 className={styles.cardTitle}>“{work.title}”</h2>
      <Link className={styles.cover} href={`/${artist.slug}/${work.id}`} aria-label={`${work.title} by ${artist.name}`} />
      {track && <SoundBadge track={track} title={work.title} />}
    </article>
  );
}

// The cover an artist uploaded, or else the first picture among its works.
export function showCover(artist: Artist, show: Show) {
  return show.coverUrl ?? artist.works.find((w) => show.workIds.includes(w.id) && w.coverUrl)?.coverUrl ?? null;
}

// Exhibition: a wide cover with the artist, where and when, and the title.
export function ShowCard({ artist, show, today }: { artist: Artist; show: Show; today: string }) {
  const timing = showTiming(show, today);
  const left = timing === "now" ? daysLeft(show.endsOn, today) : null;
  const where = show.city || show.venue;
  const when = showWhenText(show);
  return (
    <Link className={`${styles.show} ${styles.shade}`} href={`/${artist.slug}/shows/${show.slug}`}>
      <Picture className={styles.cardImg} src={showCover(artist, show)} fallback={artist.cardBg} />
      <Byline artist={artist} size={28} />
      <span className={styles.showMeta}>
        {where && (
          <span>
            {PIN_SM}
            {where}
          </span>
        )}
        {when && (
          <span>
            {CALENDAR_SM}
            {when}
          </span>
        )}
        {timing === "past" && <span className={styles.badge}>Ended</span>}
        {left != null && left <= 7 && <span className={styles.badge}>{left <= 0 ? "Last day" : "Closing soon"}</span>}
      </span>
      <h2 className={styles.showTitle}>{show.title}</h2>
    </Link>
  );
}

// Hot Artist!: one work in an artist's strip, as wide as its picture.
export function StripTile({ artist, work }: { artist: Artist; work: Work }) {
  return (
    <Link className={styles.stripTile} href={`/${artist.slug}/${work.id}`}>
      {work.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={work.coverUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        <span style={{ position: "absolute", inset: 0, background: artist.cardBg }} />
      )}
      <span className={styles.tileText}>
        <span className={styles.tileTitle}>{work.title}</span>
        <span className={styles.tileDate}>{dayMonthYear(work.createdAt)}</span>
      </span>
    </Link>
  );
}

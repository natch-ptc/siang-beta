import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Picture, showCover, workTrack } from "@/components/cards";
import ReportButton from "@/components/ReportButton";
import ShareButton from "@/components/ShareButton";
import SoundBadge from "@/components/SoundBadge";
import { loadArtist } from "@/lib/load";
import { clock, daysLeft, showTiming, showWhenText, todayInThailand } from "@/lib/format";
import { CALENDAR_ICON, CLOCK_ICON, CLOSE_BIG, PIN_ICON, TICKET_ICON } from "@/lib/icons";
import { showShare } from "@/lib/share";
import { isCollection } from "@/lib/types";
import app from "@/components/app.module.css";
import styles from "@/components/Work.module.css";

type Props = { params: Promise<{ slug: string; show: string }> };

async function load(slug: string, showSlug: string) {
  const artist = await loadArtist(slug);
  const show = artist?.shows.find((sh) => sh.slug === decodeURIComponent(showSlug).toLowerCase());
  return artist && show ? { artist, show, works: artist.works.filter((w) => show.workIds.includes(w.id)) } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, show } = await params;
  const found = await load(slug, show);
  if (!found) return { title: "Siang.co" };
  const { artist, show: sh } = found;
  const cover = showCover(artist, sh);
  return {
    title: `${sh.title} · ${artist.name} · Siang.co`,
    description: isCollection(sh)
      ? `A collection of works by ${artist.name}, with sound, on Siang.`
      : `${artist.name} at ${[sh.venue, showWhenText(sh)].filter(Boolean).join(", ")}. See and hear the works on Siang.`,
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

// "12 days left", for a show that is on now and has an end date.
function leftText(days: number) {
  if (days <= 0) return "Last day";
  return days === 1 ? "1 day left" : `${days} days left`;
}

// siang.co/<artist>/shows/<show>: an exhibition (what you need to actually
// go: dates, place, hours, entry — PRD 6.5) or a collection, then its works
// as a numbered list to tap (PRD 6.10).
export default async function ShowPage({ params }: Props) {
  const { slug, show: showSlug } = await params;
  const found = await load(slug, showSlug);
  if (!found) notFound();
  const { artist, show, works } = found;
  const today = todayInThailand();
  const collection = isCollection(show);
  const timing = showTiming(show, today);
  const left = timing === "now" ? daysLeft(show.endsOn, today) : null;
  const when = showWhenText(show);

  return (
    <main className={`${app.app} ${app.appBare}`}>
      <article className={styles.page}>
        <header className={styles.head}>
          <Link href={`/${artist.slug}`} className={styles.who}>
            <Avatar artist={artist} size={52} />
            <span className={styles.whoText}>
              <span className={styles.whoName}>{artist.name}</span>
              <span className={styles.whoHandle}>@{artist.slug}</span>
            </span>
          </Link>
          <Link href={`/${artist.slug}`} className={styles.close} aria-label={`Close, and go to ${artist.name}'s page`}>
            {CLOSE_BIG}
          </Link>
        </header>

        <Picture className={styles.cover} src={showCover(artist, show)} fallback={artist.cardBg} />
        <p className={styles.kicker}>{collection ? "Collection" : `${show.kind === "solo" ? "Solo" : "Group"} exhibition`}</p>
        <h1 className={styles.showTitle}>{show.title}</h1>

        {!collection && (
          <div className={styles.info}>
            {when && (
              <div className={styles.infoRow}>
                {CALENDAR_ICON}
                <span>
                  {when}
                  {show.startsOn && ` ${(show.endsOn ?? show.startsOn).slice(0, 4)}`}
                </span>
                {timing === "past" && <em>Ended</em>}
                {timing === "upcoming" && <em>Coming</em>}
                {left != null && <em>{left <= 7 ? `Closing soon · ${leftText(left)}` : leftText(left)}</em>}
              </div>
            )}
            <a
              className={styles.infoRow}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(show.geo || show.venue)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {PIN_ICON}
              <span>{[show.venue, show.city && !show.venue.includes(show.city) ? show.city : ""].filter(Boolean).join(", ")}</span>
              <em>Map</em>
            </a>
            {show.hours && (
              <div className={styles.infoRow}>
                {CLOCK_ICON}
                <span>{show.hours}</span>
              </div>
            )}
            {show.entry && (
              <div className={styles.infoRow}>
                {TICKET_ICON}
                <span>{show.entry}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.acts}>
          <ShareButton info={showShare(artist, show)} />
        </div>

        <section className={styles.section}>
          <h2>
            {works.length} work{works.length === 1 ? "" : "s"}
          </h2>
          {works.length === 0 ? (
            <p className={styles.sub}>No works added yet.</p>
          ) : (
            <div className={styles.works}>
              {works.map((w, i) => {
                const track = workTrack(w);
                return (
                  <div key={w.dbId} className={styles.workRow}>
                    <span className={styles.num}>{i + 1}</span>
                    <span className={styles.thumb} style={{ background: w.coverUrl ? `center/cover no-repeat url("${w.coverUrl}")` : artist.cardBg }} />
                    <span className={styles.workText}>
                      <b>{w.title}</b>
                      <span>{[artist.name, w.durationSec ? clock(w.durationSec) : ""].filter(Boolean).join(" · ")}</span>
                    </span>
                    <Link href={`/${artist.slug}/${w.id}`} aria-label={`${i + 1}. ${w.title}`} />
                    {track && <SoundBadge track={track} title={w.title} />}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.cta}>
            <Link href="/exhibitions" className={app.btnGhost}>
              More exhibitions
            </Link>
            <Link href={`/${artist.slug}`} className={app.btn}>
              {artist.name}
            </Link>
          </div>
        </section>
        <div className={styles.foot}>
          <ReportButton />
        </div>
      </article>
    </main>
  );
}

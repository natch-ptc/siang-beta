import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, ShowCard, StripTile, workTrack } from "@/components/cards";
import ReportButton from "@/components/ReportButton";
import SaveButton, { SeenStamp } from "@/components/SaveButton";
import ScaleFigure from "@/components/ScaleFigure";
import ShareButton from "@/components/ShareButton";
import WavePlayer from "@/components/WavePlayer";
import { loadArtist } from "@/lib/load";
import { todayInThailand } from "@/lib/format";
import { CLOSE_BIG } from "@/lib/icons";
import { formatCode, workShare } from "@/lib/share";
import { isCollection, type Work } from "@/lib/types";
import app from "@/components/app.module.css";
import styles from "@/components/Work.module.css";

type Props = { params: Promise<{ slug: string; work: string }> };

async function load(slug: string, workSlug: string) {
  const artist = await loadArtist(slug);
  const work = artist?.works.find((w) => w.id === decodeURIComponent(workSlug).toLowerCase());
  return artist && work ? { artist, work } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, work } = await params;
  const found = await load(slug, work);
  if (!found) return { title: "Siang.co" };
  return {
    title: `${found.work.title} · ${found.artist.name} · Siang.co`,
    description: found.work.description || `${found.work.title} by ${found.artist.name}, with the artist's own sound, on Siang.`,
    openGraph: found.work.coverUrl ? { images: [found.work.coverUrl] } : undefined,
  };
}

const cm = (n: number) => String(Math.round(n * 10) / 10);

function sizeText(work: Work) {
  if (!work.heightCm || !work.widthCm) return "";
  return [work.heightCm, work.widthCm, work.depthCm].filter((n): n is number => !!n).map(cm).join(" × ") + " cm";
}

// siang.co/<artist>/<work>: a work's page, in full (PRD rule 1: nothing is
// locked behind a scan). The work code address, siang.co/w/123456, lands here too.
export default async function WorkPage({ params }: Props) {
  const { slug, work: workSlug } = await params;
  const found = await load(slug, workSlug);
  if (!found) notFound();
  const { artist, work } = found;
  const today = todayInThailand();
  const track = workTrack(work);
  const size = sizeText(work);
  // Exhibitions are where to go and see it; the collections it belongs to are on the artist's page.
  const shows = artist.shows.filter((sh) => work.showSlugs.includes(sh.slug) && !isCollection(sh));
  const more = artist.works.filter((w) => w.id !== work.id).slice(0, 8);
  const path = `${artist.slug}/${work.id}`;

  return (
    <main className={`${app.app} ${app.appBare}`}>
      <Suspense>
        <SeenStamp path={path} today={today} />
      </Suspense>
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

        <h1 className={styles.title}>{work.title}</h1>
        {work.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.art} src={work.coverUrl} alt={work.title} />
        ) : (
          <div className={`${styles.art} ${styles.artBlank}`} style={{ background: artist.cardBg }} />
        )}

        {/* A work with no sound still looks finished: the picture and the text lead (PRD 10). */}
        {track && <WavePlayer track={track} seed={work.code} />}
        {work.soundCredit && <p className={styles.credit}>Example sound for the demo: {work.soundCredit}</p>}
        {work.description && <p className={styles.story}>{work.description}</p>}

        <div className={styles.acts}>
          <SaveButton path={path} />
          <ShareButton info={workShare(artist, work)} />
        </div>

        <dl className={styles.facts}>
          {work.year && (
            <div className={styles.fact}>
              <dt>Year</dt>
              <dd>{work.year}</dd>
            </div>
          )}
          {work.medium && (
            <div className={styles.fact}>
              <dt>Medium</dt>
              <dd>{work.medium}</dd>
            </div>
          )}
          {size && (
            <div className={styles.fact}>
              <dt>Size</dt>
              <dd>{size}</dd>
            </div>
          )}
          <div className={styles.fact}>
            <dt>Work code</dt>
            <dd>{formatCode(work.code)}</dd>
          </div>
        </dl>
        {work.heightCm && work.widthCm && <ScaleFigure heightCm={work.heightCm} widthCm={work.widthCm} />}

        {shows.length > 0 && (
          <section className={styles.section}>
            <h2>Where to see it</h2>
            <div className={styles.stack}>
              {shows.map((show) => (
                <ShowCard key={show.slug} artist={artist} show={show} today={today} />
              ))}
            </div>
          </section>
        )}

        {more.length > 0 && (
          <section className={styles.section}>
            <h2>More from {artist.name}</h2>
            <div className={`${app.strip} ${styles.bleed}`} style={{ marginTop: 0 }}>
              {more.map((w) => (
                <StripTile key={w.dbId} artist={artist} work={w} />
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.cta}>
            <Link href="/" className={app.btnGhost}>
              Explore Siang
            </Link>
            <Link href="/login?mode=signup" className={app.btn}>
              Create your profile
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

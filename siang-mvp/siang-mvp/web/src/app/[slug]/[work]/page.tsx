import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Avatar, ShowCard, StripTile, workTrack } from "@/components/cards";
import ReportButton from "@/components/ReportButton";
import SaveButton, { SeenStamp } from "@/components/SaveButton";
import ScaleFigure from "@/components/ScaleFigure";
import ShareButton from "@/components/ShareButton";
import ViewBeacon from "@/components/ViewBeacon";
import PageTransition, { BACK, Morph } from "@/components/PageTransition";
import WavePlayer from "@/components/WavePlayer";
import { isOfficial } from "@/lib/beta";
import { loadArtist, loadOwnSlug } from "@/lib/load";
import { todayInThailand } from "@/lib/format";
import { CLOSE_BIG } from "@/lib/icons";
import { formatCode, workShare } from "@/lib/share";
import { isCollection, type Artist, type Availability, type Work } from "@/lib/types";
import app from "@/components/app.module.css";
import styles from "@/components/Work.module.css";

type Props = { params: Promise<{ slug: string; work: string }> };

async function load(slug: string, workSlug: string) {
  const artist = await loadArtist(slug);
  if (!artist) return null;
  const id = decodeURIComponent(workSlug).toLowerCase();
  return { artist, id, work: artist.works.find((w) => w.id === id) ?? null, takenDown: artist.takenDown.find((w) => w.id === id) ?? null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, work } = await params;
  const found = await load(slug, work);
  if (!found?.work) return { title: found?.takenDown ? `${found.takenDown.title} · Siang.co` : "Siang.co" };
  return {
    title: `${found.work.title} · ${found.artist.name} · Siang.co`,
    description: found.work.description || `${found.work.title} by ${found.artist.name}, with the artist's own sound, on Siang.`,
    openGraph: found.work.coverUrl ? { images: [found.work.coverUrl] } : undefined,
  };
}

const cm = (n: number) => String(Math.round(n * 10) / 10);

// The size as the artist wrote it, or else built from the measurements.
function sizeText(work: Work) {
  if (work.sizeText) return work.sizeText;
  if (!work.heightCm || !work.widthCm) return "";
  return [work.heightCm, work.widthCm, work.depthCm].filter((n): n is number => !!n).map(cm).join(" × ") + " cm";
}

const AVAILABILITY: Record<Availability, string> = { available: "Available", sold: "Sold", not_for_sale: "Not for sale" };

function Header({ artist }: { artist: Artist }) {
  return (
    <header className={styles.head}>
      <Link href={`/${artist.slug}`} className={styles.who} transitionTypes={BACK}>
        <Avatar artist={artist} size={52} />
        <span className={styles.whoText}>
          <span className={styles.whoName}>{artist.name}</span>
          <span className={styles.whoHandle}>@{artist.slug}</span>
        </span>
      </Link>
      <Link href={`/${artist.slug}`} className={styles.close} transitionTypes={BACK} aria-label={`Close, and go to ${artist.name}'s page`}>
        {CLOSE_BIG}
      </Link>
    </header>
  );
}

// siang.co/<artist>/<work>: a work's page, in full (PRD rule 1: nothing is
// locked behind a scan). The work code address, siang.co/w/123456, lands here too.
export default async function WorkPage({ params }: Props) {
  const { slug, work: workSlug } = await params;
  const found = await load(slug, workSlug);
  if (!found) notFound();
  const { artist, work } = found;
  // The artist changed their handle: send old links and printed codes to the new address.
  if (artist.slug !== decodeURIComponent(slug).toLowerCase()) redirect(`/${artist.slug}/${found.id}`);

  // A work that was taken down keeps its address: a simple page, not an error.
  if (!work) {
    if (!found.takenDown) notFound();
    return (
      <main className={app.app}>
        <PageTransition>
        <article className={styles.page}>
          <Header artist={artist} />
          <h1 className={styles.title}>{found.takenDown.title}</h1>
          <p className={styles.sub}>This work is no longer shown on Siang.</p>
          <section className={styles.section}>
            <div className={styles.cta}>
              <Link href={`/${artist.slug}`} className={app.btn}>
                See {artist.name}&apos;s page
              </Link>
            </div>
          </section>
        </article>
        </PageTransition>
      </main>
    );
  }

  const today = todayInThailand();
  const track = workTrack(work);
  const size = sizeText(work);
  // Exhibitions are where to go and see it; the collections it belongs to are on the artist's page.
  const shows = artist.shows.filter((sh) => work.showSlugs.includes(sh.slug) && !isCollection(sh));
  const more = artist.works.filter((w) => w.id !== work.id).slice(0, 8);
  const path = `${artist.slug}/${work.id}`;
  const own = (await loadOwnSlug()) === artist.slug;
  const facts: [string, string][] = [
    ["Year", work.year ? String(work.year) : ""],
    ["Medium", work.medium],
    ["Size", size],
    ["Materials", work.materials],
    ["Edition", work.edition],
    ["Price", work.price],
    ["Availability", work.availability ? AVAILABILITY[work.availability] : ""],
    ["Where it is now", work.locationNow],
    ["Credits", work.credits],
    ["Work code", formatCode(work.code)],
  ];

  return (
    <main className={app.app}>
      <Suspense>
        <SeenStamp path={path} today={today} />
      </Suspense>
      {!own && <ViewBeacon kind="artwork" id={work.dbId} />}
      <PageTransition>
      <article className={styles.page}>
        <Header artist={artist} />

        <h1 className={styles.title}>
          {isOfficial(artist.slug) && <span className={app.exampleTag}>Example</span>}
          {work.title}
        </h1>
        {work.titleEn && <p className={styles.sub}>{work.titleEn}</p>}
        {work.coverUrl ? (
          <Morph name={`work-${work.dbId}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.art} src={work.coverUrl} alt={work.title} />
          </Morph>
        ) : (
          <div className={`${styles.art} ${styles.artBlank}`} style={{ background: artist.cardBg }} />
        )}

        {/* A work with no sound still looks finished: the picture and the text lead (PRD 10). */}
        {track && <WavePlayer track={track} seed={work.code} />}
        {isOfficial(artist.slug) && <p className={styles.credit}>An example made by the Siang team, not a work for sale. Sources are under Credits.</p>}
        {work.description && <p className={styles.story}>{work.description}</p>}

        {work.images.length > 0 && (
          <div className={styles.gallery}>
            {work.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`${work.title}, picture ${i + 2}`} loading="lazy" decoding="async" />
            ))}
          </div>
        )}

        <div className={styles.acts}>
          <SaveButton path={path} />
          <ShareButton info={workShare(artist, work)} />
        </div>

        <dl className={styles.facts}>
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
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

        <div className={styles.foot}>
          <ReportButton />
        </div>
      </article>
      </PageTransition>
    </main>
  );
}

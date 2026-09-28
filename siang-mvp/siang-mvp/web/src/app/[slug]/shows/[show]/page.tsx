import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchArtistBySlug } from "@/lib/queries";
import { BETA_PATH } from "@/lib/beta";
import { PIN } from "@/lib/icons";
import frame from "@/components/ArtistPublicView.module.css";
import ds from "@/components/DetailSheet.module.css";
import styles from "@/components/WorkPage.module.css";

type Props = { params: Promise<{ slug: string; show: string }> };

async function load(slug: string, showSlug: string) {
  const supabase = await createClient();
  const found = await fetchArtistBySlug(supabase, slug.toLowerCase());
  if (!found) return null;
  const index = found.artist.shows.findIndex((sh) => sh.slug === decodeURIComponent(showSlug).toLowerCase());
  if (index < 0) return null;
  return { artist: found.artist, show: found.artist.shows[index], works: found.artist.art.filter((w) => w.showIndex === index) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, show } = await params;
  const found = await load(slug, show);
  if (!found) return { title: "Siang.co" };
  return {
    title: `${found.show.title} · ${found.artist.name} · Siang.co`,
    description: `${found.show.kind} exhibition by ${found.artist.name} at ${found.show.venue}, ${found.show.year}. Listen on Siang.`,
  };
}

// siang.co/<artist>/shows/<show>: an exhibition's page, where its share link lands.
export default async function ShowPage({ params }: Props) {
  const { slug, show: showSlug } = await params;
  const found = await load(slug, showSlug);
  if (!found) notFound();
  const { artist, show, works } = found;

  return (
    <main className={frame.page}>
      <div className={frame.column}>
        <header className={frame.top}>
          <Link href="/" aria-label="Siang">
            <Image src="/siang-logo.png" alt="Siang" width={1899} height={429} className={frame.logo} priority />
          </Link>
          <Link href={BETA_PATH} className={frame.openApp}>
            Open Siang
          </Link>
        </header>

        <div className={frame.body}>
          <p className={styles.kicker}>{show.kind} exhibition</p>
          <h1 className={styles.showTitle}>{show.title}</h1>
          <a
            className={ds.mappill}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(show.geo || show.venue)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 14 }}
          >
            {PIN}
            <span>{show.venue}</span>
          </a>

          <Link href={`/${artist.slug}`} className={styles.byline}>
            {artist.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artist.avatarUrl} alt="" />
            ) : (
              <span style={{ background: artist.cardBg }} />
            )}
            <b>{artist.name}</b>
          </Link>
          <p className={styles.showSub}>
            {show.year} · {works.length} work{works.length === 1 ? "" : "s"}
          </p>

          <div className={ds.dpanel}>
            <section className={ds.dsec}>
              <div className={ds.dsecHead}>
                <h2>Works</h2>
                <span>Tap to listen</span>
              </div>
              {works.length === 0 ? (
                <p className={frame.empty}>No works added to this exhibition yet.</p>
              ) : (
                <div className={ds.shelf}>
                  {works.map((w) => (
                    <Link key={w.id} href={`/${artist.slug}/${w.id}`} className={ds.tile}>
                      <span
                        className={`${ds.piece} ${w.coverUrl ? "" : frame.placeholderPiece}`}
                        style={w.coverUrl ? { background: `center/cover no-repeat url("${w.coverUrl}")` } : undefined}
                      />
                      <span className={ds.cap}>{w.title}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link href={`/${artist.slug}`} className={styles.artistLink}>
                See {artist.name}&apos;s page
              </Link>
            </section>

            <div className={frame.cta}>
              <p>Hear art on Siang, or make a page like this for your own work.</p>
              <div className={frame.ctaRow}>
                <Link href={BETA_PATH} className={frame.ctaLight}>
                  Open Siang
                </Link>
                <Link href="/login?mode=signup" className={frame.ctaPink}>
                  Make your page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

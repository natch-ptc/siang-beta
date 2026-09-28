import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkListen from "@/components/WorkListen";
import { createClient } from "@/lib/supabase/server";
import { fetchArtistBySlug } from "@/lib/queries";
import { BETA_PATH } from "@/lib/beta";
import { PIN } from "@/lib/icons";
import frame from "@/components/ArtistPublicView.module.css";
import ds from "@/components/DetailSheet.module.css";
import styles from "@/components/WorkPage.module.css";

type Props = { params: Promise<{ slug: string; work: string }> };

async function load(slug: string, workSlug: string) {
  const supabase = await createClient();
  const found = await fetchArtistBySlug(supabase, slug.toLowerCase());
  const work = found?.artist.art.find((w) => w.id === decodeURIComponent(workSlug).toLowerCase());
  return found && work ? { artist: found.artist, work } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, work } = await params;
  const found = await load(slug, work);
  if (!found) return { title: "Siang.co" };
  return {
    title: `${found.work.title} · ${found.artist.name} · Siang.co`,
    description: found.work.description || `Listen to ${found.work.title} by ${found.artist.name} on Siang.`,
  };
}

function formatCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

// siang.co/<artist>/<work>: where a work's printed QR code lands. Listen to
// the work, read about it, and go on to the artist's page.
export default async function WorkPage({ params }: Props) {
  const { slug, work: workSlug } = await params;
  const found = await load(slug, workSlug);
  if (!found) notFound();
  const { artist, work } = found;
  const show = artist.shows[work.showIndex];
  const more = artist.art.filter((w) => w.id !== work.id).slice(0, 3);

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
          <div
            className={`${styles.art} ${work.coverUrl ? "" : frame.placeholderPiece}`}
            style={work.coverUrl ? { background: `center/cover no-repeat url("${work.coverUrl}")` } : { background: artist.cardBg }}
          />
          <h1 className={styles.title}>{work.title}</h1>
          <Link href={`/${artist.slug}`} className={styles.by}>
            {artist.name}
          </Link>

          {work.audioUrl ? (
            <WorkListen audioUrl={work.audioUrl} durationLabel={work.durationLabel} />
          ) : (
            <p className={styles.noSound}>This work&apos;s sound isn&apos;t online yet.</p>
          )}

          {(work.description || show) && (
            <section className={styles.about}>
              <h2>About this work</h2>
              {work.description && <p>{work.description}</p>}
              <div className={styles.meta}>
                {work.listenCount.toLocaleString()} listens · code {formatCode(work.code)}
                {show && (
                  <>
                    <br />
                    Shown in {show.title}, {show.year}
                  </>
                )}
              </div>
              {show && (
                <a
                  className={ds.mappill}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(show.geo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: 14 }}
                >
                  {PIN}
                  <span>{show.venue}</span>
                </a>
              )}
            </section>
          )}

          <div className={ds.dpanel}>
            <section className={ds.dsec}>
              <div className={ds.dsecHead}>
                <h2>More from {artist.name}</h2>
              </div>
              {more.length > 0 && (
                <div className={ds.shelf}>
                  {more.map((w) => (
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

import Image from "next/image";
import Link from "next/link";
import CardFace from "@/components/CardFace";
import { BETA_PATH } from "@/lib/beta";
import { LINK_ICON, PIN, contactHref, contactIcon, contactLabel } from "@/lib/icons";
import type { ArtistLink } from "@/lib/queries";
import type { ArtistCard } from "@/lib/types";
// The public page looks like the artist's card detail in the app.
import ds from "./DetailSheet.module.css";
import styles from "./ArtistPublicView.module.css";

// siang.co/<slug>: an artist's page — their card, links (Linktree style) and works.
export default function ArtistPublicView({ artist, links }: { artist: ArtistCard; links: ArtistLink[] }) {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <header className={styles.top}>
          <Link href="/" aria-label="Siang">
            <Image src="/siang-logo.png" alt="Siang" width={1899} height={429} className={styles.logo} priority />
          </Link>
          <Link href={BETA_PATH} className={styles.openApp}>
            Open Siang
          </Link>
        </header>

        <div className={styles.body}>
          <div className={ds.hero}>
            <div className={ds.side}>
              <CardFace card={artist} />
            </div>
          </div>

          <div className={ds.dwho} style={{ marginTop: 22 }}>
            {artist.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={ds.avatar} src={artist.avatarUrl} alt="" style={{ objectFit: "cover" }} />
            ) : (
              <span className={ds.avatar} style={{ background: artist.cardBg, color: artist.cardInk }} />
            )}
            <div>
              <h1 className={ds.dname}>{artist.name}</h1>
              <div className={ds.dkind}>siang.co/{artist.slug}</div>
            </div>
          </div>
          {artist.bio && <p className={ds.dbio}>{artist.bio}</p>}

          {links.length > 0 && (
            <nav className={styles.links} aria-label={`${artist.name}'s links`}>
              {links.map((l) => (
                <a key={l.url + l.label} className={styles.linkBtn} href={l.url} target="_blank" rel="noopener noreferrer">
                  {LINK_ICON}
                  <span>{l.label}</span>
                </a>
              ))}
            </nav>
          )}

          {artist.contacts.length > 0 && (
            <div className={ds.dcontacts}>
              {artist.contacts.map((c) => (
                <a key={c.kind} className={ds.mappill} href={contactHref(c.kind, c.value)} target="_blank" rel="noopener noreferrer">
                  {contactIcon(c.kind)}
                  <span>{contactLabel(c.kind)}</span>
                </a>
              ))}
            </div>
          )}

          <div className={ds.dmeta}>
            <div className={ds.dmetaRow}>
              <b>{artist.totalListens.toLocaleString()} listens</b>
              {artist.based && (
                <a
                  className={ds.mappill}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(artist.geo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {PIN}
                  <span>{artist.based}</span>
                </a>
              )}
            </div>
            <span>
              {[artist.based, artist.country].filter(Boolean).join(", ")}
              {artist.joined && ` · on Siang since ${artist.joined}`}
            </span>
          </div>

          <div className={ds.dpanel}>
            <section className={ds.dsec}>
              <div className={ds.dsecHead}>
                <h2>Art</h2>
                <span>
                  {artist.art.length} work{artist.art.length === 1 ? "" : "s"}
                </span>
              </div>
              {artist.art.length === 0 ? (
                <p className={styles.empty}>No works published yet.</p>
              ) : (
                <div className={ds.shelf}>
                  {artist.art.map((w) => (
                    <Link key={w.id} href={`/${artist.slug}/${w.id}`} className={ds.tile}>
                      <span
                        className={`${ds.piece} ${w.coverUrl ? "" : styles.placeholderPiece}`}
                        style={w.coverUrl ? { background: `center/cover no-repeat url("${w.coverUrl}")` } : undefined}
                      />
                      <span className={ds.cap}>{w.title}</span>
                      {artist.shows[w.showIndex] && (
                        <span className={ds.loc}>
                          {PIN}
                          <span>{artist.shows[w.showIndex].venue}</span>
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {artist.shows.length > 0 && (
              <section className={ds.dsec}>
                <div className={ds.dsecHead}>
                  <h2>Exhibitions</h2>
                  <span>
                    {artist.shows.length} show{artist.shows.length === 1 ? "" : "s"}
                  </span>
                </div>
                {artist.shows.map((sh) => (
                  <div className={ds.show} key={sh.title}>
                    <div className={ds.showHead}>
                      <span className={ds.t}>
                        <em>{sh.title}</em>
                        <span className={ds.loc}>
                          {PIN}
                          <span>
                            {sh.venue} · {sh.year} · {sh.kind}
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            <div className={styles.cta}>
              <p>Hear art on Siang, or make a page like this for your own work.</p>
              <div className={styles.ctaRow}>
                <Link href={BETA_PATH} className={styles.ctaLight}>
                  Open Siang
                </Link>
                <Link href="/login?mode=signup" className={styles.ctaPink}>
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

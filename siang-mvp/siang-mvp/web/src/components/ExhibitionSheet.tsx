"use client";

import { usePlayer } from "@/lib/player";
import { PIN, BACK_CHEVRON_SVG, SHARE_GLYPH, PLAY_BIG } from "@/lib/icons";
import type { ArtistCard } from "@/lib/types";
import ArtworkPiece from "./ArtworkPiece";
import styles from "./ExhibitionSheet.module.css";

type Props = {
  artist: ArtistCard | null;
  showIndex: number | null;
  onClose: () => void;
  onOpenArtist: (artist: ArtistCard) => void;
  onShare: (artist: ArtistCard, showIndex: number) => void;
};

export default function ExhibitionSheet({ artist, showIndex, onClose, onOpenArtist, onShare }: Props) {
  const { playWork } = usePlayer();
  const open = artist !== null && showIndex !== null;
  const show = open ? artist.shows[showIndex] : null;
  const works = open ? artist.art.filter((w) => w.showIndex === showIndex) : [];

  return (
    <section className={`${styles.exh} ${open ? styles.on : ""}`} role="dialog" aria-label="Exhibition">
      {open && show && (
        <>
          <div className={styles.exhTop}>
            <button className={styles.ghostbtn} aria-label="Back" onClick={onClose}>
              {BACK_CHEVRON_SVG}
            </button>
            <button className={styles.ghostbtn} aria-label="Share this exhibition" style={{ marginLeft: "auto" }} onClick={() => onShare(artist, showIndex)}>
              {SHARE_GLYPH}
            </button>
          </div>

          <div className={styles.exhBody}>
            <h1>{show.title}</h1>
            <button
              className={styles.exhLoc}
              onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(show.geo), "_blank", "noopener")}
            >
              {PIN}
              <span>{show.venue}</span>
            </button>

            <div className={styles.exhBy}>
              <div>
                <button className={styles.exhArtist} onClick={() => onOpenArtist(artist)}>
                  {artist.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.av} src={artist.avatarUrl} alt="" style={{ objectFit: "cover" }} />
                  ) : (
                    <span className={styles.av} style={{ background: artist.cardBg, color: artist.cardInk }} />
                  )}
                  <b>{artist.name}</b>
                </button>
                <div className={styles.exhSub}>
                  {show.kind} exhibition · {show.year} · {works.length} work{works.length === 1 ? "" : "s"}
                </div>
              </div>
              <button
                className={styles.playall}
                aria-label="Play this exhibition"
                disabled={works.length === 0}
                onClick={() => playWork(artist, works, 0, "exhibition", show.title)}
              >
                {PLAY_BIG}
              </button>
            </div>

            <div className={styles.shelf}>
              {works.map((w, i) => (
                <button key={w.id} className={styles.tile} onClick={() => playWork(artist, works, i, "exhibition", show.title)}>
                  <ArtworkPiece
                    className={styles.piece}
                    markId={artist.markId}
                    workIndex={artist.art.indexOf(w)}
                    cardBg={artist.cardBg}
                    cardInk={artist.cardInk}
                    seedKey={w.title}
                    coverUrl={w.coverUrl}
                  />
                  <span className={styles.cap}>{w.title}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

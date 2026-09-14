"use client";

import { useRef } from "react";
import { usePlayer } from "@/lib/player";
import { tintPair } from "@/lib/color";
import { secs, clock } from "@/lib/format";
import { MARKS } from "@/lib/marks";
import {
  PIN,
  CHEVRON_DOWN_SVG,
  SHARE_GLYPH,
  PLAY_BIG,
  PAUSE_BIG,
  SHUFFLE_SVG,
  PREV_SVG,
  NEXT_SVG,
  REPEAT_SVG,
  REPEAT_ONE_SVG,
} from "@/lib/icons";
import type { ArtistCard, Artwork } from "@/lib/types";
import ArtworkPiece from "./ArtworkPiece";
import styles from "./NowPlaying.module.css";

type Props = {
  onOpenArtist: (artist: ArtistCard) => void;
  onShareWork: (artist: ArtistCard, work: Artwork) => void;
};

export default function NowPlaying({ onOpenArtist, onShareWork }: Props) {
  const { queue, elapsed, playing, shuffleOn, repeatOn, togglePlay, step, seekPct, toggleShuffle, toggleRepeat, nowOpen, closeNow } = usePlayer();
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);

  if (!queue) return <section className={styles.now} role="dialog" aria-label="Now playing" />;

  const artist = queue.artist;
  const w = queue.works[queue.order[queue.pos]];
  const total = secs(w.durationLabel);
  const pct = Math.min(100, (elapsed / total) * 100);
  const tone = tintPair(artist.tint);
  const show = artist.shows[w.showIndex];
  const nextWork = queue.works[queue.order[(queue.pos + 1) % queue.order.length]];

  const seekFrom = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    seekPct(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className={`${styles.now} ${nowOpen ? styles.on : ""}`} role="dialog" aria-label="Now playing" style={{ background: tone.wash }}>
      <div className={styles.nowTop}>
        <button className={styles.ghostbtn} aria-label="Close the player" onClick={closeNow}>
          {CHEVRON_DOWN_SVG}
        </button>
        <span className={styles.ctx}>
          <small>{queue.kind === "exhibition" ? "Playing from exhibition" : "Playing from artist"}</small>
          <b>{queue.label}</b>
        </span>
        <button className={styles.ghostbtn} aria-label="Share this work" onClick={() => onShareWork(artist, w)}>
          {SHARE_GLYPH}
        </button>
      </div>

      <div className={styles.nowBody}>
        <ArtworkPiece
          className={styles.nowArt}
          markId={artist.markId}
          workIndex={artist.art.indexOf(w)}
          cardBg={artist.cardBg}
          cardInk={artist.cardInk}
          seedKey={w.title}
          coverUrl={w.coverUrl}
        />
        <div className={styles.nowTitle}>
          <span className={styles.t}>
            <h1>{w.title}</h1>
            <p>{artist.name}</p>
          </span>
        </div>

        <div className={styles.scrub}>
          <div
            className={styles.track}
            ref={trackRef}
            onPointerDown={(e) => {
              scrubbing.current = true;
              (e.target as Element).setPointerCapture(e.pointerId);
              seekFrom(e.clientX);
            }}
            onPointerMove={(e) => {
              if (scrubbing.current) seekFrom(e.clientX);
            }}
            onPointerUp={() => (scrubbing.current = false)}
            onPointerCancel={() => (scrubbing.current = false)}
          >
            <i style={{ width: pct + "%" }} />
            <b style={{ left: pct + "%" }} />
          </div>
          <div className={styles.times}>
            <span>{clock(elapsed)}</span>
            <span>{w.durationLabel}</span>
          </div>
        </div>

        <div className={styles.transport}>
          <button
            className={shuffleOn ? styles.act : ""}
            aria-label="Shuffle"
            aria-pressed={shuffleOn}
            onClick={toggleShuffle}
          >
            {SHUFFLE_SVG}
          </button>
          <button aria-label="Previous" onClick={() => step(-1)}>
            {PREV_SVG}
          </button>
          <button className={styles.big} aria-label="Play or pause" onClick={togglePlay}>
            {playing ? PAUSE_BIG : PLAY_BIG}
          </button>
          <button aria-label="Next" onClick={() => step(1)}>
            {NEXT_SVG}
          </button>
          <button
            className={repeatOn ? styles.act : ""}
            aria-label="Repeat this work"
            aria-pressed={repeatOn}
            onClick={toggleRepeat}
          >
            {repeatOn ? REPEAT_ONE_SVG : REPEAT_SVG}
          </button>
        </div>

        <div className={styles.aboutart} style={{ background: tone.panel }}>
          <h2>About this work</h2>
          <p>{w.description}</p>
          <div className={styles.meta}>
            {w.listenCount.toLocaleString()} listens
            {show && (
              <>
                <br />
                Shown in {show.title}, {show.year}
              </>
            )}
          </div>
          {show && (
            <button
              className={styles.mappilldark}
              onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(show.geo), "_blank", "noopener")}
            >
              {PIN}
              <span>{show.venue}</span>
            </button>
          )}
        </div>

        <div className={styles.byrow}>
          <button
            className={styles.main}
            onClick={() => {
              closeNow();
              onOpenArtist(artist);
            }}
          >
            {artist.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.avatar} src={artist.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span className={styles.avatar} style={{ background: artist.cardBg, color: artist.cardInk }} dangerouslySetInnerHTML={{ __html: MARKS[artist.markId] ?? "" }} />
            )}
            <span className={styles.t}>
              <b>{artist.name}</b>
              <span>{artist.based}</span>
            </span>
          </button>
        </div>

        <button className={styles.nextrow} onClick={() => step(1)}>
          <ArtworkPiece
            className={styles.cov}
            markId={artist.markId}
            workIndex={artist.art.indexOf(nextWork)}
            cardBg={artist.cardBg}
            cardInk={artist.cardInk}
            seedKey={nextWork.title}
            coverUrl={nextWork.coverUrl}
          />
          <span className={styles.t}>
            <b>{nextWork.title}</b>
            <span>Next in {queue.label}</span>
          </span>
        </button>
      </div>
    </section>
  );
}

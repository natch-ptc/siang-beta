"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { stamp } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { PIN, CHEV, CLOSE_GLYPH, SHARE_GLYPH, QR_GLYPH, BACK_GLYPH, contactIcon, contactLabel, contactHref } from "@/lib/icons";
import type { ArtistCard } from "@/lib/types";
import CardFace from "./CardFace";
import ArtworkPiece from "./ArtworkPiece";
import styles from "./DetailSheet.module.css";

type Props = {
  card: ArtistCard | null;
  position: string; // e.g. "01 of 07" or "Not in your Pocket yet"
  onClose: () => void;
  onOpenExhibition: (artist: ArtistCard, showIndex: number) => void;
  onShareArtist: (artist: ArtistCard) => void;
};

export default function DetailSheet({ card, position, onClose, onOpenExhibition, onShareArtist }: Props) {
  const { playWork } = usePlayer();
  const [flipped, setFlipped] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const [peek, setPeek] = useState(false);

  // reset per-card UI state whenever a new card is opened, then nudge the
  // card once the sheet has finished sliding up, hinting that it flips
  useEffect(() => {
    setFlipped(false);
    setHintGone(false);
    setPeek(false);
    if (!card) return;
    const t = setTimeout(() => setPeek(true), 640);
    return () => clearTimeout(t);
  }, [card?.slug]);

  const open = card !== null;

  return (
    <section className={`${styles.detail} ${open ? styles.on : ""}`} role="dialog" aria-label="Card detail">
      {card && (
        <>
          <div className={styles.detailTop}>
            <div className={styles.k}>{position}</div>
            <div className={styles.dtActs}>
              <button className={styles.close} aria-label="Share this artist page" onClick={() => onShareArtist(card)}>
                {SHARE_GLYPH}
              </button>
              <button className={styles.close} aria-label="Close card" onClick={onClose}>
                {CLOSE_GLYPH}
              </button>
            </div>
          </div>

          <div className={styles.detailBody}>
            <div className={styles.hero}>
              <div
                className={`${styles.flip} ${flipped ? styles.flipped : ""} ${peek ? styles.peek : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={flipped}
                aria-label="Flip the card to see its code"
                onClick={() => {
                  setFlipped((f) => !f);
                  setHintGone(true);
                  setPeek(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFlipped((f) => !f);
                    setHintGone(true);
                    setPeek(false);
                  }
                }}
                onAnimationEnd={() => setPeek(false)}
              >
                <div className={styles.side}>
                  <CardFace card={card} />
                  <span className={styles.flipbtn} aria-hidden="true">
                    {QR_GLYPH}
                  </span>
                </div>
                <div className={`${styles.side} ${styles.back}`}>
                  <div className={styles.backface} style={{ background: card.cardBg, color: card.cardInk }}>
                    <div className={styles.qrpanel}>
                      <QRCodeSVG value={`https://siang.co/${card.slug}`} size={256} style={{ width: "100%", height: "100%" }} />
                    </div>
                    <div className={styles.backtext}>
                      <div className={styles.r1}>
                        <b>
                          {card.based}, {card.country}
                        </b>
                        <span>{stamp(card.addedAt)}</span>
                      </div>
                      <div className={styles.r2}>
                        <em>{card.name}</em>
                      </div>
                      <div className={styles.r3}>
                        Scan to open their page
                        <br />
                        siang.co/{card.slug}
                      </div>
                    </div>
                    <span className={styles.flipbtn} aria-hidden="true">
                      {BACK_GLYPH}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className={styles.fliphint} style={{ opacity: hintGone ? 0 : 1 }}>
              Tap the code to open the artist&apos;s side
            </p>

            <div className={styles.dwho}>
              {card.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.avatar} src={card.avatarUrl} alt="" style={{ objectFit: "cover" }} />
              ) : (
                <span className={styles.avatar} style={{ background: card.cardBg, color: card.cardInk }} />
              )}
              <div>
                <h1 className={styles.dname}>{card.name}</h1>
                <div className={styles.dkind}>siang.co/{card.slug}</div>
              </div>
            </div>
            {card.bio && <p className={styles.dbio}>{card.bio}</p>}
            {card.contacts.length > 0 && (
              <div className={styles.dcontacts}>
                {card.contacts.map((c) => (
                  <a key={c.kind} className={styles.mappill} href={contactHref(c.kind, c.value)} target="_blank" rel="noopener noreferrer">
                    {contactIcon(c.kind)}
                    <span>{contactLabel(c.kind)}</span>
                  </a>
                ))}
              </div>
            )}

            <div className={styles.dmeta}>
              <div className={styles.dmetaRow}>
                <b>{card.monthlyListeners.toLocaleString()} listens this month</b>
                <button
                  className={styles.mappill}
                  onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(card.geo), "_blank", "noopener")}
                >
                  {PIN}
                  <span>{card.based}</span>
                </button>
              </div>
              <span>
                {card.based}, {card.country} · on Siang since {card.joined}
              </span>
            </div>

            <div className={styles.dpanel}>
              <section className={styles.dsec}>
                <div className={styles.dsecHead}>
                  <h2>Art</h2>
                  <span>
                    {card.art.length} work{card.art.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className={styles.shelf}>
                  {card.art.map((w, i) => {
                    const show = card.shows[w.showIndex];
                    return (
                      <button key={w.id} className={styles.tile} onClick={() => playWork(card, card.art, i, "artist", card.name)}>
                        <ArtworkPiece
                          className={styles.piece}
                          markId={card.markId}
                          workIndex={i}
                          cardBg={card.cardBg}
                          cardInk={card.cardInk}
                          seedKey={w.title}
                          coverUrl={w.coverUrl}
                        />
                        <span className={styles.cap}>{w.title}</span>
                        {show && (
                          <span className={styles.loc}>
                            {PIN}
                            <span>{show.venue}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.dsec}>
                <div className={styles.dsecHead}>
                  <h2>Exhibitions</h2>
                  <span>
                    {card.shows.length} show{card.shows.length === 1 ? "" : "s"}
                  </span>
                </div>
                {card.shows.map((sh, i) => {
                  const works = card.art.filter((w) => w.showIndex === i);
                  return (
                    <div className={styles.show} key={sh.title}>
                      <button className={styles.showHead} onClick={() => onOpenExhibition(card, i)}>
                        <span className={styles.t}>
                          <em>{sh.title}</em>
                          <span className={styles.loc}>
                            {PIN}
                            <span>{sh.venue}</span>
                          </span>
                        </span>
                        <span className={styles.more}>
                          {works.length} work{works.length === 1 ? "" : "s"}
                          {CHEV}
                        </span>
                      </button>
                      {works.length > 0 && (
                        <div className={styles.shelf}>
                          {works.slice(0, 3).map((w, wi) => (
                            <button key={w.id} className={styles.tile} onClick={() => playWork(card, works, wi, "exhibition", sh.title)}>
                              <ArtworkPiece
                                className={styles.piece}
                                markId={card.markId}
                                workIndex={card.art.indexOf(w)}
                                cardBg={card.cardBg}
                                cardInk={card.cardInk}
                                seedKey={w.title}
                                coverUrl={w.coverUrl}
                              />
                              <span className={styles.cap}>{w.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

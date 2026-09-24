"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { shareInfo, type ShareTarget } from "@/lib/share";
import { CHECK_ICON } from "@/lib/icons";
import ArtworkPiece from "./ArtworkPiece";
import styles from "./ShareSheet.module.css";

export default function ShareSheet({ target, onClose }: { target: ShareTarget | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const open = target !== null;
  const info = target ? shareInfo(target) : null;
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  async function copyLink() {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — the link is still visible to copy by hand
    }
  }

  async function nativeShare() {
    if (!info) return;
    try {
      await navigator.share({ title: info.title, url: info.url });
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  }

  function downloadQR() {
    if (!info) return;
    const canvas = document.getElementById("share-qr-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${info.file}-qr.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.on : ""}`} onClick={onClose} />
      <section className={`${styles.sheet} ${open ? styles.on : ""}`} role="dialog" aria-label="Share">
        {target && info && (
          <>
            <div className={styles.handle} />
            <div className={styles.head}>
              <Cover target={target} />
              <span className={styles.t}>
                <b>{info.title}</b>
                <span>{info.subtitle}</span>
              </span>
            </div>

            <div className={styles.body}>
              <p className={styles.link}>{info.url}</p>
              <div className={styles.acts}>
                <button className={styles.pillPink} onClick={copyLink}>
                  {copied ? (
                    <>
                      {CHECK_ICON} Copied
                    </>
                  ) : (
                    "Copy link"
                  )}
                </button>
                {canShare && (
                  <button className={styles.pillDk} onClick={nativeShare}>
                    Share…
                  </button>
                )}
              </div>

              <section className={styles.qrSec}>
                <div className={styles.qrHead}>
                  <h2>Print the code</h2>
                  <span>Scan to open</span>
                </div>
                <div className={styles.qrWrap}>
                  <QRCodeCanvas id="share-qr-canvas" value={info.url} size={200} includeMargin />
                </div>
                <button className={styles.pillDk} onClick={downloadQR}>
                  Download QR, PNG
                </button>
              </section>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function Cover({ target }: { target: ShareTarget }) {
  if (target.kind === "artist") {
    return target.artist.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={styles.cov} src={target.artist.avatarUrl} alt="" style={{ objectFit: "cover" }} />
    ) : (
      <span className={styles.cov} style={{ background: target.artist.cardBg, color: target.artist.cardInk }} />
    );
  }
  if (target.kind === "work") {
    return (
      <ArtworkPiece
        className={styles.cov}
        markId={target.artist.markId}
        workIndex={target.artist.art.indexOf(target.work)}
        cardBg={target.artist.cardBg}
        cardInk={target.artist.cardInk}
        seedKey={target.work.title}
        coverUrl={target.work.coverUrl}
      />
    );
  }
  return <span className={styles.cov} style={{ background: target.artist.cardBg, color: target.artist.cardInk }} />;
}

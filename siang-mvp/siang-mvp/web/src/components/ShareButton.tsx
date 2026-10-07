"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { CHECK_ICON, CLOSE_ICON, DOWNLOAD_BOLD, LINK_ICON, QR_SCAN_ICON, SHARE_ICON } from "@/lib/icons";
import { downloadDataUrl, drawLabel } from "@/lib/label";
import { formatCode, type ShareInfo } from "@/lib/share";
import { Mark } from "./Logo";
import Spinner from "./Spinner";
import styles from "./Sheet.module.css";

// The one share button every page has (PRD 5.4): copy the link, show the QR,
// download it, or download a printable label. There is no separate screen for
// making a QR.
export default function ShareButton({ info, look = "pill" }: { info: ShareInfo; look?: "pill" | "icon" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={look === "icon" ? styles.icon : styles.pill}
        onClick={() => setOpen(true)}
        aria-label={look === "icon" ? `Share ${info.title}` : undefined}
      >
        {SHARE_ICON}
        {look !== "icon" && "Share"}
      </button>
      {open && <ShareSheet info={info} onClose={() => setOpen(false)} />}
    </>
  );
}

export function ShareSheet({ info, onClose }: { info: ShareInfo; onClose: () => void }) {
  const qrCanvas = useRef<HTMLCanvasElement>(null);
  const qrSvg = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  // The sheet only ever renders in the browser, after a tap.
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — the link is written out below to copy by hand
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: info.title, url: info.url });
    } catch {
      // the visitor closed the system share sheet
    }
  }

  async function downloadLabel() {
    if (!qrCanvas.current) return;
    setBusy(true);
    try {
      const label = await drawLabel(info, qrCanvas.current);
      downloadDataUrl(label.toDataURL("image/png"), `${info.file}-label.png`);
    } finally {
      setBusy(false);
    }
  }

  function downloadQrPng() {
    if (qrCanvas.current) downloadDataUrl(qrCanvas.current.toDataURL("image/png"), `${info.file}-qr.png`);
  }

  function downloadQrSvg() {
    if (!qrSvg.current) return;
    const svg = new XMLSerializer().serializeToString(qrSvg.current);
    downloadDataUrl("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg), `${info.file}-qr.svg`);
  }

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-label={`Share ${info.title}`}>
        <div className={styles.handle} />
        <div className={styles.head}>
          <h2 className={styles.kicker}>
            Print the label <Mark height={15} />
          </h2>
          <button className={styles.close} onClick={onClose} aria-label="Close" type="button">
            {CLOSE_ICON}
          </button>
        </div>

        <div className={styles.label}>
          <div className={styles.labelQr}>
            <QRCodeSVG ref={qrSvg} value={info.qrUrl} size={512} level="M" marginSize={0} />
          </div>
          <div className={styles.labelText}>
            <b className={styles.labelTitle}>{info.title}</b>
            <span className={styles.labelSub}>{info.subtitle}</span>
            {info.meta && <span className={styles.labelMeta}>{info.meta}</span>}
            <span className={styles.labelFoot}>
              {info.code && <b className={styles.labelCode}>{formatCode(info.code)}</b>}
              {info.hint}
              <br />
              {info.qrUrl.replace(/^https?:\/\//, "")}
            </span>
          </div>
        </div>

        <div className={styles.acts}>
          <button className={styles.act} onClick={downloadLabel} disabled={busy} type="button">
            {busy ? <Spinner size={16} /> : DOWNLOAD_BOLD} Download label
          </button>
          <button className={styles.actGhost} onClick={downloadQrSvg} type="button">
            {QR_SCAN_ICON} QR only, SVG
          </button>
          <button className={styles.actGhost} onClick={downloadQrPng} type="button">
            {QR_SCAN_ICON} QR only, PNG
          </button>
          <button className={styles.actGhost} onClick={copyLink} type="button">
            {copied ? CHECK_ICON : LINK_ICON} {copied ? "Copied" : "Copy link"}
          </button>
          {canShare && (
            <button className={`${styles.actGhost} ${styles.wide}`} onClick={nativeShare} type="button">
              {SHARE_ICON} Share…
            </button>
          )}
        </div>
        <p className={styles.link}>{info.url}</p>

        <div className={styles.offscreen} aria-hidden="true">
          <QRCodeCanvas ref={qrCanvas} value={info.qrUrl} size={1024} level="M" marginSize={0} />
        </div>
      </section>
    </>
  );
}

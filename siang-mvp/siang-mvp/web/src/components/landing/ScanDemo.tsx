"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import styles from "./ScanDemo.module.css";

/**
 * "Scan the demo" trigger button. Desktop visitors get a small popover with
 * a QR code that opens /mvp on their phone; a direct "open it here" link
 * covers mobile visitors (and anyone who'd rather not reach for a phone).
 */
export default function ScanDemo() {
  const [open, setOpen] = useState(false);
  // Set after mount only — matches the server-rendered placeholder first,
  // then swaps in the real origin, avoiding a hydration mismatch.
  const [origin, setOrigin] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const mvpUrl = origin ? `${origin}/mvp` : "/mvp";

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((v) => !v)}>
        Scan the demo
      </button>
      {open && (
        <div className={styles.popover}>
          <div className={styles.qrBox}>
            {origin ? (
              <QRCodeCanvas value={mvpUrl} size={160} includeMargin />
            ) : (
              <div className={styles.qrPlaceholder} />
            )}
          </div>
          <p className={styles.label}>siang.co/demo</p>
          <p className={styles.sub}>Opens with no app and no sign up</p>
          <Link href="/mvp" className={styles.openLink}>
            open it here
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import styles from "./StaticQr.module.css";

/** Always-visible QR block for the dedicated "Scan it with your phone" section. */
export default function StaticQr() {
  // Set after mount only — matches the server-rendered placeholder first,
  // then swaps in the real origin, avoiding a hydration mismatch.
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const mvpUrl = origin ? `${origin}/mvp` : "/mvp";

  return (
    <div>
      <div className={styles.qrBox}>
        {origin ? (
          <QRCodeCanvas value={mvpUrl} size={200} includeMargin />
        ) : (
          <div className={styles.qrPlaceholder} />
        )}
      </div>
      <p className={styles.label}>siang.co/demo</p>
      <Link href="/mvp" className={styles.openLink}>
        open it here
      </Link>
    </div>
  );
}

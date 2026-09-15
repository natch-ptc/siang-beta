"use client";

import { QRCodeCanvas } from "qrcode.react";
import styles from "./LandingPage.module.css";

/** Small real QR code for the piece-page print mockup illustration. */
export default function PrintQr() {
  return (
    <div className={styles.printQr}>
      <QRCodeCanvas value="https://siang.co/a/9k2f" size={84} includeMargin={false} />
    </div>
  );
}

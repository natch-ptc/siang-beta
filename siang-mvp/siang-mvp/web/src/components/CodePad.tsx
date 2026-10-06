"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { BACKSPACE_ICON, CLOSE_ICON, SCAN_ICON } from "@/lib/icons";
import { formatCode } from "@/lib/share";
import Logo from "./Logo";
import Spinner from "./Spinner";
import app from "./app.module.css";
import styles from "./Work.module.css";

const CODE_LENGTH = 6;

// Where a scanned QR leads inside Siang, or null if it isn't one of ours.
function siangPath(text: string): string | null {
  const t = text.trim();
  if (/^\d{6}$/.test(t)) return `/w/${t}`;
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    const host = url.hostname.replace(/^www\./, "");
    return host === "siang.co" || host === window.location.hostname ? url.pathname + url.search : null;
  } catch {
    return null;
  }
}

// siang.co/w: type the six-digit code printed on a work's label, or scan its
// QR. `wrong` is a code that was just tried and belongs to no work.
export default function CodePad({ wrong }: { wrong?: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState("");
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState(wrong ? `No work has the code ${formatCode(wrong)}. Check the label and try again.` : "");
  const [scanning, setScanning] = useState(false);

  const open = useCallback(
    (code: string) => {
      setOpening(true);
      router.push(`/w/${code}`);
    },
    [router]
  );

  const press = useCallback(
    (key: string) => {
      if (opening) return;
      setMessage("");
      if (key === "back") {
        setDigits(digits.slice(0, -1));
      } else if (digits.length < CODE_LENGTH) {
        const next = digits + key;
        setDigits(next);
        if (next.length === CODE_LENGTH) open(next);
      }
    },
    [digits, open, opening]
  );

  const onScanned = useCallback(
    (path: string) => {
      setScanning(false);
      setOpening(true);
      router.push(path);
    },
    [router]
  );

  // Short numbers are show numbers, which only mean something inside a show (PRD 10).
  function submit() {
    if (digits.length === CODE_LENGTH) open(digits);
    else if (digits.length <= 3) setMessage("Numbers work inside a show. Scan the QR at the door, or type the 6 digit code from a label.");
    else setMessage("A work code has 6 digits.");
  }

  // A desktop keyboard works too.
  useEffect(() => {
    if (scanning) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, scanning]);

  return (
    <main className={`${app.app} ${app.appBare}`}>
      <header className={app.top}>
        <Link href="/" className={app.logoLink}>
          <Logo height={30} />
        </Link>
        <Link href="/" className={app.iconBtn} aria-label="Close">
          {CLOSE_ICON}
        </Link>
      </header>

      <div className={styles.pad}>
        <h1 className={styles.padTitle}>Type the work code</h1>
        <p className={styles.padLead}>The six digits printed on the label beside the work.</p>

        <div className={styles.digits} aria-label={`Code so far: ${digits || "empty"}`} role="status">
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <span key={i} className={`${styles.digit} ${i === digits.length && !opening ? styles.digitNext : ""}`}>
              {digits[i] ?? ""}
            </span>
          ))}
        </div>
        <p className={styles.padMsg} role="alert">
          {opening ? <Spinner size={18} label="Opening the work" /> : message}
        </p>

        <div className={styles.keys}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
            <button key={k} className={styles.key} onClick={() => press(k)} type="button">
              {k}
            </button>
          ))}
          <button className={`${styles.key} ${styles.keyQuiet}`} onClick={() => setScanning(true)} aria-label="Scan a QR code" type="button">
            {SCAN_ICON}
          </button>
          <button className={styles.key} onClick={() => press("0")} type="button">
            0
          </button>
          <button className={`${styles.key} ${styles.keyQuiet}`} onClick={() => press("back")} aria-label="Delete the last digit" type="button">
            {BACKSPACE_ICON}
          </button>
        </div>

        <div className={styles.padActs}>
          <button className={app.btn} onClick={submit} disabled={opening || digits.length === 0} type="button">
            Open the work
          </button>
        </div>
      </div>

      {scanning && <QrCamera onClose={() => setScanning(false)} onFound={onScanned} />}
    </main>
  );
}

// The camera, reading QR codes until it sees one that leads into Siang.
function QrCamera({ onFound, onClose }: { onFound: (path: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    const canvas = document.createElement("canvas");

    function tick() {
      const video = videoRef.current;
      if (stopped || !video) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const path = siangPath(jsQR(frame.data, frame.width, frame.height)?.data ?? "");
        if (path) {
          navigator.vibrate?.(12);
          onFound(path);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (stopped) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        tick();
      } catch {
        if (!stopped) setFailed(true);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onFound]);

  return (
    <div className={styles.camera} role="dialog" aria-modal="true" aria-label="Scan a QR code">
      <video ref={videoRef} playsInline muted />
      {!failed && <div className={styles.frame} />}
      <div className={styles.cameraBar}>
        <span>{failed ? "The camera isn't available. Type the code instead." : "Point the camera at a Siang QR code."}</span>
        <button className={app.btnGhost} onClick={onClose} type="button">
          Close
        </button>
      </div>
    </div>
  );
}

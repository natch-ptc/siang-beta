"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { CLOSE_ICON, HASH_ICON } from "@/lib/icons";
import { formatCode } from "@/lib/share";
import Logo from "./Logo";
import ScanPreview, { lookupPreview, type Preview } from "./ScanPreview";
import Spinner from "./Spinner";
import app from "./app.module.css";
import sheet from "./Sheet.module.css";
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

// siang.co/w, the Scan tab: the camera reads a Siang QR code, and a button at
// the top right opens the keypad for the six-digit code printed on a work's
// label. `wrong` is a code that was just tried and belongs to no work, so the
// keypad opens with that message.
export default function CodePad({ wrong }: { wrong?: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState("");
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState(wrong ? `No work has the code ${formatCode(wrong)}. Check the label and try again.` : "");
  const [keypad, setKeypad] = useState(Boolean(wrong));
  const [cameraFailed, setCameraFailed] = useState(false);
  const [scanned, setScanned] = useState<{ path: string; preview: Preview | null } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false); // a code was read and its card is up
  const ignored = useRef<string | null>(null); // the code the visitor just closed, still in view

  const open = useCallback(
    (code: string) => {
      setOpening(true);
      router.push(`/w/${code}`);
    },
    [router],
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
    [digits, open, opening],
  );

  const onCameraFailed = useCallback(() => setCameraFailed(true), []);

  // Opening a scanned page: this screen fades out first, then the page fades in.
  const go = useCallback(
    (path: string) => {
      setLeaving(true);
      setTimeout(() => router.push(path), 280);
    },
    [router],
  );

  // A QR was read: show who or what it is, and open it when the card is tapped.
  const onScanned = useCallback(
    (path: string) => {
      if (busy.current || ignored.current === path) return;
      busy.current = true;
      navigator.vibrate?.(12);
      setScanned({ path, preview: null });
      lookupPreview(path).then((preview) => {
        if (preview) setScanned((s) => (s?.path === path ? { path, preview } : s));
        else go(path); // nothing to preview: just open it
      });
    },
    [go],
  );

  // Back to scanning. The code still in view is ignored until the camera sees another one, or a few seconds pass.
  const dismiss = useCallback(() => {
    if (scanned) {
      const path = scanned.path;
      ignored.current = path;
      setTimeout(() => {
        if (ignored.current === path) ignored.current = null;
      }, 4000);
    }
    busy.current = false;
    setScanned(null);
  }, [scanned]);

  // Short numbers are show numbers, which only mean something inside a show (PRD 10).
  function submit() {
    if (digits.length === CODE_LENGTH) open(digits);
    else if (digits.length <= 3) setMessage("Numbers work inside a show. Scan the QR at the door, or type the 6 digit code from a label.");
    else setMessage("A work code has 6 digits.");
  }

  // A desktop keyboard works too.
  useEffect(() => {
    if (!keypad) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, keypad]);

  return (
    <>
      <main className={`${styles.scanPage} ${leaving ? styles.scanLeaving : ""}`}>
        <QrCamera paused={keypad || opening || scanned !== null} onFound={onScanned} onFailed={onCameraFailed} />

        <header className={styles.scanTop}>
          <Link href="/" className={app.logoLink}>
            <Logo height={30} />
          </Link>
          <button className={styles.numBtn} onClick={() => setKeypad(true)} aria-label="Type a work code" type="button">
            {HASH_ICON}
            <span>Enter number</span>
          </button>
        </header>

        {scanned ? (
          <ScanPreview preview={scanned.preview} onOpen={() => go(scanned.path)} onDismiss={dismiss} />
        ) : (
          <p className={styles.scanHint} role="status">
            {opening ? (
              <Spinner size={18} label="Opening" />
            ) : cameraFailed ? (
              "The camera isn't available. Enter the number from the label instead."
            ) : (
              "Point the camera at a Siang QR code."
            )}
          </p>
        )}
      </main>

      {/* Outside the page layer, so it sits above the tab bar. */}
      {keypad && (
        <>
          <div className={sheet.scrim} onClick={() => setKeypad(false)} />
          <div className={`${sheet.sheet} ${styles.padSheet}`} role="dialog" aria-modal="true" aria-label="Type the work code">
            <div className={sheet.handle} />
            <div className={styles.padHead}>
              <h1 className={styles.padTitle}>Type the work code</h1>
              <button className={app.iconBtn} onClick={() => setKeypad(false)} aria-label="Close" type="button">
                {CLOSE_ICON}
              </button>
            </div>
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
              <button className={`${styles.key} ${styles.keyQuiet} ${styles.keyText}`} onClick={() => press("back")} type="button">
                Delete
              </button>
              <button className={styles.key} onClick={() => press("0")} type="button">
                0
              </button>
              <button className={`${styles.key} ${styles.keyGo}`} onClick={submit} disabled={opening || digits.length === 0} type="button">
                Go
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// The camera, reading QR codes until it sees one that leads into Siang.
function QrCamera({ onFound, onFailed, paused }: { onFound: (path: string) => void; onFailed: () => void; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  // Read inside the frame loop, so the camera keeps running while the keypad is up but reads nothing.
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    const canvas = document.createElement("canvas");

    function tick() {
      const video = videoRef.current;
      if (stopped || !video) return;
      if (!pausedRef.current && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const path = siangPath(jsQR(frame.data, frame.width, frame.height)?.data ?? "");
        if (path) onFound(path); // the loop keeps running, so scanning resumes if the card is closed
      }
      raf = requestAnimationFrame(tick);
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        tick();
      } catch {
        if (!stopped) {
          setFailed(true);
          onFailed();
        }
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onFound, onFailed]);

  return (
    <div className={styles.camera}>
      <video ref={videoRef} playsInline muted />
      {!failed && <div className={styles.frame} />}
    </div>
  );
}

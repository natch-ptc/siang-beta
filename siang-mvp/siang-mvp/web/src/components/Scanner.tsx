"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";
import { MARKS } from "@/lib/marks";
import { usePlayer } from "@/lib/player";
import { CLOSE_GLYPH } from "@/lib/icons";
import type { ArtistCard, Artwork } from "@/lib/types";
import ArtworkPiece from "./ArtworkPiece";
import styles from "./Scanner.module.css";

type Props = {
  open: boolean;
  allCards: ArtistCard[];
  ownedSlugs: string[];
  onClose: () => void;
  onAdd: (slug: string) => void;
};

type Found = { kind: "artist"; card: ArtistCard; alreadyOwned: boolean } | { kind: "work"; artist: ArtistCard; work: Artwork };

// Pull a slug out of whatever a QR code encoded: a full "https://siang.co/slug"
// URL (what the card-back QR actually contains), a bare "siang.co/slug", or
// just the slug itself typed into the manual fallback. A "siang.co/w/123456"
// link (a work's QR) is handled separately, by code.
function extractSlug(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/siang\.co\/([a-z0-9-]+)/i);
  if (match) return match[1].toLowerCase();
  return trimmed.toLowerCase().replace(/^\/+|\/+$/g, "");
}

function extractWorkCode(text: string): string | null {
  const match = text.match(/siang\.co\/w\/(\d{6})/i) || text.match(/^\s*(\d{6})\s*$/);
  return match ? match[1] : null;
}

function findWorkByCode(allCards: ArtistCard[], code: string): { artist: ArtistCard; work: Artwork } | null {
  for (const artist of allCards) {
    const work = artist.art.find((w) => w.code === code);
    if (work) return { artist, work };
  }
  return null;
}

export default function Scanner({ open, allCards, ownedSlugs, onClose, onAdd }: Props) {
  const { playWork } = usePlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [camReady, setCamReady] = useState(false);
  const [camFailed, setCamFailed] = useState(false);
  const [found, setFound] = useState<Found | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [codeValue, setCodeValue] = useState("");

  // Start the camera once per time the scanner opens; keep the stream alive
  // across "found" state changes so re-arming doesn't re-prompt permissions.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setFound(null);
    setCamFailed(false);
    setCamReady(false);

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          if (!cancelled) setCamReady(true);
        }
      } catch {
        if (!cancelled) setCamFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Run the decode loop whenever the camera is live and nothing is found yet;
  // pauses itself the instant a code is decoded, resumes on "Scan again".
  useEffect(() => {
    if (!open || !camReady || found) return;

    let cancelled = false;
    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(frame.data, frame.width, frame.height);
      if (code?.data && !cancelled) {
        handleDecoded(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, camReady, found]);

  function handleDecoded(raw: string) {
    const workCode = extractWorkCode(raw);
    if (workCode) {
      const hit = findWorkByCode(allCards, workCode);
      if (hit) {
        if (navigator.vibrate) navigator.vibrate(12);
        setFound({ kind: "work", artist: hit.artist, work: hit.work });
        return;
      }
    }
    const slug = extractSlug(raw);
    const card = allCards.find((c) => c.slug === slug);
    if (!card) return; // not a Siang code (or an artist we don't have) — keep scanning
    if (navigator.vibrate) navigator.vibrate(12);
    setFound({ kind: "artist", card, alreadyOwned: ownedSlugs.includes(card.slug) });
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    setManualError(null);
    const slug = extractSlug(manualValue);
    const card = allCards.find((c) => c.slug === slug);
    if (!card) {
      setManualError("No artist found for that link.");
      return;
    }
    setFound({ kind: "artist", card, alreadyOwned: ownedSlugs.includes(card.slug) });
  }

  // Live-match as the six digits are typed, like a printed work label.
  const codeDigits = codeValue.replace(/\D/g, "").slice(0, 6);
  const codeMatch = useMemo(() => (codeDigits.length === 6 ? findWorkByCode(allCards, codeDigits) : null), [codeDigits, allCards]);
  const codeFormatted = codeDigits.length > 3 ? codeDigits.slice(0, 3) + " " + codeDigits.slice(3) : codeDigits;

  function openWork(artist: ArtistCard, work: Artwork) {
    playWork(artist, artist.art, artist.art.indexOf(work), "artist", artist.name);
    onClose();
  }

  if (!open) return null;

  return (
    <section className={styles.scanner} role="dialog" aria-label="Scan a card">
      <div className={styles.nocam} />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} className={`${styles.cam} ${camReady ? styles.live : ""}`} playsInline muted autoPlay />
      <canvas ref={canvasRef} hidden />
      <div className={styles.veil} />

      <div className={styles.top}>
        <div className={styles.k}>Scan a code</div>
        <button className={styles.close} aria-label="Close scanner" onClick={onClose}>
          {CLOSE_GLYPH}
        </button>
      </div>

      {!found && (
        <div className={styles.mid}>
          <div className={`${styles.reticle} ${camFailed ? styles.idle : ""}`}>
            <svg className={styles.corners} viewBox="0 0 100 100" fill="none">
              <path
                d="M6 26V12a6 6 0 0 1 6-6h14M74 6h14a6 6 0 0 1 6 6v14M94 74v14a6 6 0 0 1-6 6H74M26 94H12a6 6 0 0 1-6-6V74"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            {!camFailed && <span className={styles.sweep} />}
          </div>
          <p className={styles.copy}>
            {camFailed ? "Camera unavailable. Use a link or a work's code below instead." : "Hold an artist card or a work's QR inside the frame"}
          </p>
        </div>
      )}

      {found?.kind === "artist" && (
        <div className={styles.found}>
          {found.card.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.foundCard} src={found.card.avatarUrl} alt="" style={{ width: 64, height: 64, objectFit: "cover" }} />
          ) : (
            <div className={styles.foundCard} style={{ background: found.card.cardBg, color: found.card.cardInk }} dangerouslySetInnerHTML={{ __html: MARKS[found.card.markId] ?? "" }} />
          )}
          <div className={styles.foundText}>
            <b>{found.card.name}</b>
            <span>
              {found.card.based}, {found.card.country}
            </span>
          </div>
          <div className={styles.acts}>
            {found.alreadyOwned ? (
              <button className={styles.pillSolid} disabled>
                Already in Pocket
              </button>
            ) : (
              <button
                className={styles.pillSolid}
                onClick={() => {
                  onAdd(found.card.slug);
                  onClose();
                }}
              >
                Add to Pocket
              </button>
            )}
            <button className={styles.pill} onClick={() => setFound(null)}>
              Scan again
            </button>
          </div>
        </div>
      )}

      {found?.kind === "work" && (
        <div className={styles.found}>
          <ArtworkPiece
            className={styles.foundCardWork}
            markId={found.artist.markId}
            workIndex={found.artist.art.indexOf(found.work)}
            cardBg={found.artist.cardBg}
            cardInk={found.artist.cardInk}
            seedKey={found.work.title}
            coverUrl={found.work.coverUrl}
          />
          <div className={styles.foundText}>
            <b>{found.work.title}</b>
            <span>{found.artist.name}</span>
          </div>
          <div className={styles.acts}>
            <button className={styles.pillSolid} onClick={() => openWork(found.artist, found.work)}>
              Open work
            </button>
            <button className={styles.pill} onClick={() => setFound(null)}>
              Scan again
            </button>
          </div>
        </div>
      )}

      <div className={styles.foot}>
        <form onSubmit={submitManual} className={styles.manualForm}>
          <input
            className={styles.manualInput}
            placeholder="siang.co/artist-slug"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
          />
          <button className={styles.pillDk} type="submit">
            Look up
          </button>
        </form>
        {manualError && <p className={styles.manualError}>{manualError}</p>}

        <p className={styles.orLabel}>or enter a work&apos;s six-digit code</p>
        <input
          className={styles.codeInput}
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="go"
          placeholder="000 000"
          aria-label="Work code"
          value={codeFormatted}
          onChange={(e) => setCodeValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && codeMatch) openWork(codeMatch.artist, codeMatch.work);
          }}
        />
        {codeDigits.length === 6 &&
          (codeMatch ? (
            <button className={styles.codeRow} onClick={() => openWork(codeMatch.artist, codeMatch.work)}>
              <ArtworkPiece
                className={styles.codeRowCov}
                markId={codeMatch.artist.markId}
                workIndex={codeMatch.artist.art.indexOf(codeMatch.work)}
                cardBg={codeMatch.artist.cardBg}
                cardInk={codeMatch.artist.cardInk}
                seedKey={codeMatch.work.title}
                coverUrl={codeMatch.work.coverUrl}
              />
              <span className={styles.foundText}>
                <b>{codeMatch.work.title}</b>
                <span>{codeMatch.artist.name}</span>
              </span>
            </button>
          ) : (
            <p className={styles.manualError}>No work uses that code.</p>
          ))}
      </div>
    </section>
  );
}

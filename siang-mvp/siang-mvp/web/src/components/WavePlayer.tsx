"use client";

import { useRef } from "react";
import { clock } from "@/lib/format";
import { HEADPHONES_ICON, PAUSE_XL, PLAY_XL } from "@/lib/icons";
import { seekSound, toggleSound, useSound, type Track } from "@/lib/sound";
import Spinner from "./Spinner";
import styles from "./Work.module.css";

const BARS = 26;

// Bar heights (0..1) drawn from the work's code, so a work always has the
// same waveform. It is a picture of sound, not a reading of the recording.
function bars(seed: string) {
  let n = 0;
  for (const ch of seed) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: BARS }, (_, i) => {
    n = (n * 1664525 + 1013904223) >>> 0;
    const swell = 0.55 + 0.45 * Math.sin((i / BARS) * Math.PI * 3 + (n % 7));
    return Math.max(0.12, Math.min(1, (0.25 + (n / 2 ** 32) * 0.75) * swell));
  });
}

// A work's sound on its page: one tap plays it (PRD 12.2); drag along the
// waveform to move through it.
export default function WavePlayer({ track, seed }: { track: Track; seed: string }) {
  const sound = useSound(track.id);
  const waveRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const heights = bars(seed);
  const total = sound.duration || track.durationSec;
  const fraction = total ? Math.min(1, sound.time / total) : 0;
  const started = sound.playing || sound.time > 0;

  function seek(clientX: number) {
    const el = waveRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    seekSound(track.id, (clientX - r.left) / r.width);
  }

  return (
    <>
      <div className={styles.player}>
        <button className={styles.play} onClick={() => toggleSound(track)} aria-label={sound.playing ? "Pause" : "Play"} type="button">
          {sound.loading ? <Spinner size={24} /> : sound.playing ? PAUSE_XL : PLAY_XL}
        </button>
        <div
          ref={waveRef}
          className={styles.wave}
          role="slider"
          tabIndex={0}
          aria-label="Position in the sound"
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(sound.time)}
          aria-valuetext={`${clock(sound.time)} of ${clock(total)}`}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            seek(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && seek(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={(e) => {
            if (!total || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
            e.preventDefault();
            seekSound(track.id, (sound.time + (e.key === "ArrowRight" ? 5 : -5)) / total);
          }}
        >
          {heights.map((h, i) => (
            <i key={i} className={started && (i + 0.5) / BARS <= fraction ? styles.heard : undefined} style={{ height: `${Math.round(h * 100)}%` }} />
          ))}
        </div>
        <span className={styles.time}>{clock(started ? Math.max(0, total - sound.time) : total)}</span>
      </div>
      {!started && <p className={styles.hint}>{HEADPHONES_ICON} In a gallery? Use headphones.</p>}
    </>
  );
}

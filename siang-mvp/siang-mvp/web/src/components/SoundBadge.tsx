"use client";

import { Pause } from "@phosphor-icons/react/dist/ssr";
import { toggleSound, useSound, type Track } from "@/lib/sound";
import Spinner from "./Spinner";
import styles from "./app.module.css";

// The small waveform drawn on a card's sound button.
const BARS = [3, 6, 11, 14, 9, 12, 14, 8, 4, 10, 13, 6, 3];
const WAVE_GLYPH = (
  <svg width="16" height="14" viewBox="0 0 26 14" fill="currentColor" aria-hidden="true">
    {BARS.map((h, i) => (
      <rect key={i} x={i * 2} y={(14 - h) / 2} width="1.1" height={h} rx="0.55" />
    ))}
  </svg>
);

// Plays a work's sound from a card, without leaving the list.
export default function SoundBadge({ track, title }: { track: Track; title: string }) {
  const sound = useSound(track.id);
  const active = sound.playing || sound.loading;
  return (
    <button
      type="button"
      className={`${styles.sound} ${active ? styles.soundOn : ""}`}
      onClick={() => toggleSound(track)}
      aria-label={sound.playing ? `Pause ${title}` : `Play ${title}`}
      aria-pressed={sound.playing}
    >
      <span>{sound.loading ? <Spinner size={14} /> : sound.playing ? <Pause size={13} weight="fill" /> : WAVE_GLYPH}</span>
    </button>
  );
}

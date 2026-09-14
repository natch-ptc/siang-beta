"use client";

import { useRef, useState } from "react";
import { usePlayer } from "@/lib/player";
import { tintPair } from "@/lib/color";
import { secs } from "@/lib/format";
import { PLAY_SVG, PAUSE_SVG } from "@/lib/icons";
import styles from "./MiniPlayer.module.css";

export default function MiniPlayer() {
  const { queue, elapsed, playing, togglePlay, openNow, dismiss } = usePlayer();
  const [drag, setDrag] = useState<{ dx: number; dragging: boolean }>({ dx: 0, dragging: false });
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);

  if (!queue) return null;
  const w = queue.works[queue.order[queue.pos]];
  const tone = tintPair(queue.artist.tint);
  const pct = Math.min(100, (elapsed / secs(w.durationLabel)) * 100);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest(`.${styles.pp}`)) return;
    startX.current = e.clientX;
    pointerId.current = e.pointerId;
    setDrag({ dx: 0, dragging: true });
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.dragging) return;
    setDrag({ dx: e.clientX - startX.current, dragging: true });
  };
  const endDrag = () => {
    if (!drag.dragging) return;
    if (Math.abs(drag.dx) > 90) {
      dismiss();
    } else if (Math.abs(drag.dx) < 6) {
      openNow();
    }
    setDrag({ dx: 0, dragging: false });
  };

  return (
    <div
      className={styles.mini}
      style={{
        background: tone.bar,
        transform: `translateX(calc(-50% + ${drag.dx}px))`,
        opacity: drag.dragging ? 1 - Math.min(Math.abs(drag.dx), 220) / 300 : 1,
        transition: drag.dragging ? "none" : undefined,
      }}
      role="button"
      aria-label="Open the player"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span className={styles.cov} style={{ background: queue.artist.cardBg }} />
      <span className={styles.t}>
        <b>{w.title}</b>
        <span>{queue.artist.name}</span>
      </span>
      <button
        className={styles.pp}
        aria-label="Play or pause"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        {playing ? PAUSE_SVG : PLAY_SVG}
      </button>
      <span className={styles.line}>
        <i style={{ width: pct + "%" }} />
      </span>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { clock, secs } from "@/lib/format";
import { PAUSE_BIG, PLAY_BIG } from "@/lib/icons";
import { noteHeard } from "@/lib/listens";
import styles from "./WorkPage.module.css";

// Play button + scrub bar for one work's sound on its public page.
export default function WorkListen({ artworkId, audioUrl, durationLabel }: { artworkId: string; audioUrl: string; durationLabel: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(secs(durationLabel));
  const scrubbing = useRef(false);

  const pct = total ? Math.min(100, (elapsed / total) * 100) : 0;

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      setLoading(true);
      a.play().catch(() => setLoading(false));
    } else {
      a.pause();
    }
  }

  function seekFrom(clientX: number) {
    const a = audioRef.current;
    const el = trackRef.current;
    if (!a || !el || !total) return;
    const r = el.getBoundingClientRect();
    a.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * total;
    setElapsed(a.currentTime);
  }

  return (
    <div className={styles.listen}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setTotal(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setElapsed(t);
          noteHeard(artworkId, t, total);
        }}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
      />
      <button className={styles.play} onClick={toggle} aria-label={playing ? "Pause" : "Play"} type="button">
        {loading ? <span className={styles.ring} aria-hidden /> : playing ? PAUSE_BIG : PLAY_BIG}
      </button>
      <div className={styles.scrub}>
        <div
          ref={trackRef}
          className={styles.track}
          onPointerDown={(e) => {
            scrubbing.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            seekFrom(e.clientX);
          }}
          onPointerMove={(e) => scrubbing.current && seekFrom(e.clientX)}
          onPointerUp={() => (scrubbing.current = false)}
          onPointerCancel={() => (scrubbing.current = false)}
        >
          <i style={{ width: pct + "%" }} />
          <b style={{ left: pct + "%" }} />
        </div>
        <div className={styles.times}>
          <span>{clock(elapsed)}</span>
          <span>{clock(total)}</span>
        </div>
      </div>
    </div>
  );
}

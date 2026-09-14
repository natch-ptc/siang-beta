"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { secs } from "./format";
import type { ArtistCard, Artwork } from "./types";

export type QueueKind = "artist" | "exhibition";

export type Queue = {
  artist: ArtistCard;
  works: Artwork[];
  order: number[]; // permutation of indices into `works`, used for shuffle
  pos: number; // index into `order`
  kind: QueueKind;
  label: string; // context label: artist name or exhibition title
};

type PlayerState = {
  queue: Queue | null;
  elapsed: number;
  playing: boolean;
  shuffleOn: boolean;
  repeatOn: boolean;
  nowOpen: boolean;
};

type PlayerApi = PlayerState & {
  curWork: () => Artwork | null;
  playWork: (artist: ArtistCard, works: Artwork[], index: number, kind: QueueKind, label: string) => void;
  togglePlay: () => void;
  setPlaying: (on: boolean) => void;
  step: (dir: 1 | -1) => void;
  seekPct: (pct: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  dismiss: () => void;
  openNow: () => void;
  closeNow: () => void;
};

const PlayerContext = createContext<PlayerApi | null>(null);

function shuffledOrder(length: number, keepFirst: number) {
  const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== keepFirst);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [keepFirst, ...rest];
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlayingState] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [nowOpen, setNowOpen] = useState(false);

  const queueRef = useRef(queue);
  queueRef.current = queue;
  const repeatRef = useRef(repeatOn);
  repeatRef.current = repeatOn;

  const curWork = useCallback(() => {
    const q = queueRef.current;
    return q ? q.works[q.order[q.pos]] : null;
  }, []);

  // the seeded (no real audio file) ticker: advance one second at a time while playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const q = queueRef.current;
      if (!q) return;
      const w = q.works[q.order[q.pos]];
      setElapsed((e) => {
        const total = secs(w.durationLabel);
        const next = e + 1;
        if (next >= total) {
          if (repeatRef.current) return 0;
          stepInternal(1);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, queue?.pos, queue?.artist.id]);

  function stepInternal(dir: 1 | -1) {
    setQueue((q) => {
      if (!q) return q;
      const pos = (q.pos + dir + q.order.length) % q.order.length;
      return { ...q, pos };
    });
    setElapsed(0);
  }

  const playWork = useCallback((artist: ArtistCard, works: Artwork[], index: number, kind: QueueKind, label: string) => {
    const order = shuffleOn ? shuffledOrder(works.length, index) : works.map((_, i) => i);
    const pos = shuffleOn ? 0 : order.indexOf(index);
    setQueue({ artist, works, order, pos, kind, label });
    setElapsed(0);
    setPlayingState(true);
    setNowOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleOn]);

  const setPlaying = useCallback((on: boolean) => setPlayingState(on), []);
  const togglePlay = useCallback(() => setPlayingState((p) => !p), []);

  const step = useCallback((dir: 1 | -1) => {
    if (!queueRef.current) return;
    if (dir === -1 && elapsed > 3) {
      setElapsed(0);
      return;
    }
    stepInternal(dir);
    setPlayingState(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const seekPct = useCallback((pct: number) => {
    const q = queueRef.current;
    if (!q) return;
    const w = q.works[q.order[q.pos]];
    const total = secs(w.durationLabel);
    setElapsed(Math.max(0, Math.min(total - 1, (pct / 100) * total)));
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleOn((on) => {
      const next = !on;
      setQueue((q) => {
        if (!q) return q;
        if (next) {
          const cur = q.order[q.pos];
          return { ...q, order: shuffledOrder(q.works.length, cur), pos: 0 };
        }
        const cur = q.order[q.pos];
        return { ...q, order: q.works.map((_, i) => i), pos: cur };
      });
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => setRepeatOn((r) => !r), []);

  const dismiss = useCallback(() => {
    setPlayingState(false);
    setQueue(null);
    setNowOpen(false);
  }, []);

  const openNow = useCallback(() => setNowOpen(true), []);
  const closeNow = useCallback(() => setNowOpen(false), []);

  return (
    <PlayerContext.Provider
      value={{
        queue,
        elapsed,
        playing,
        shuffleOn,
        repeatOn,
        nowOpen,
        curWork,
        playWork,
        togglePlay,
        setPlaying,
        step,
        seekPct,
        toggleShuffle,
        toggleRepeat,
        dismiss,
        openNow,
        closeNow,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}

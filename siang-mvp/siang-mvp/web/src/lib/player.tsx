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

const workAt = (q: Queue | null) => (q ? q.works[q.order[q.pos]] : null);

// Works with an uploaded sound play through one shared <audio> element. Seeded
// works without a file keep the old behaviour: a one-second ticker that walks
// through their listed duration, so the demo still "plays".
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlayingState] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [nowOpen, setNowOpen] = useState(false);

  // Latest values for callbacks that outlive a render (audio events, the ticker).
  const queueRef = useRef(queue);
  const repeatRef = useRef(repeatOn);
  const playingRef = useRef(playing);
  const elapsedRef = useRef(elapsed);
  useEffect(() => {
    queueRef.current = queue;
    repeatRef.current = repeatOn;
    playingRef.current = playing;
    elapsedRef.current = elapsed;
  }, [queue, repeatOn, playing, elapsed]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Set before the audio element exists so its "ended" handler can call it.
  const stepRef = useRef<(dir: 1 | -1) => void>(() => {});

  const curWork = useCallback(() => workAt(queueRef.current), []);

  const audio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      a.addEventListener("timeupdate", () => setElapsed(Math.floor(a.currentTime)));
      a.addEventListener("ended", () => {
        if (repeatRef.current) {
          a.currentTime = 0;
          void a.play();
          return;
        }
        stepRef.current(1);
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  // A play() that was superseded by a pause or a new track rejects with
  // AbortError — that's expected. Anything else (autoplay blocked, a broken
  // file) means nothing is playing, so show the play button again.
  const onPlayError = useCallback((e: unknown) => {
    if (e instanceof DOMException && e.name === "AbortError") return;
    setPlayingState(false);
  }, []);

  // Point the audio element at a work and start it. Called straight from the
  // tap handler, not an effect, so mobile browsers treat it as user-initiated.
  const startWork = useCallback(
    (w: Artwork | null, artist: ArtistCard | null, play: boolean) => {
      const a = audio();
      if (!w?.audioUrl) {
        a.pause();
        a.removeAttribute("src");
        a.load();
        return;
      }
      if (a.src !== w.audioUrl) a.src = w.audioUrl;
      a.currentTime = 0;
      if (play) a.play().catch(onPlayError);
      if (artist && typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: w.title,
          artist: artist.name,
          artwork: w.coverUrl ? [{ src: w.coverUrl }] : [],
        });
      }
    },
    [audio, onPlayError]
  );

  const stepInternal = useCallback(
    (dir: 1 | -1, play = true) => {
      const q = queueRef.current;
      if (!q) return;
      const pos = (q.pos + dir + q.order.length) % q.order.length;
      const next = { ...q, pos };
      queueRef.current = next;
      setQueue(next);
      setElapsed(0);
      startWork(workAt(next), q.artist, play);
    },
    [startWork]
  );
  useEffect(() => {
    stepRef.current = (dir) => stepInternal(dir);
  }, [stepInternal]);

  // The ticker, only for works without a sound file.
  useEffect(() => {
    if (!playing || workAt(queue)?.audioUrl) return;
    const id = setInterval(() => {
      const w = workAt(queueRef.current);
      if (!w) return;
      const next = elapsedRef.current + 1;
      if (next < secs(w.durationLabel)) setElapsed(next);
      else if (repeatRef.current) setElapsed(0);
      else stepInternal(1);
    }, 1000);
    return () => clearInterval(id);
  }, [playing, queue, stepInternal]);

  // Stop the sound if the provider goes away (navigating off the app).
  useEffect(() => () => audioRef.current?.pause(), []);

  const playWork = useCallback(
    (artist: ArtistCard, works: Artwork[], index: number, kind: QueueKind, label: string) => {
      const order = shuffleOn ? shuffledOrder(works.length, index) : works.map((_, i) => i);
      const pos = shuffleOn ? 0 : order.indexOf(index);
      const q = { artist, works, order, pos, kind, label };
      queueRef.current = q;
      setQueue(q);
      setElapsed(0);
      setPlayingState(true);
      // Like tapping a song in Spotify: the full player slides up. Closing it
      // leaves the mini player and the sheet the listener came from.
      setNowOpen(true);
      startWork(works[index], artist, true);
    },
    [shuffleOn, startWork]
  );

  const setPlaying = useCallback(
    (on: boolean) => {
      setPlayingState(on);
      if (!workAt(queueRef.current)?.audioUrl) return;
      const a = audio();
      if (on) a.play().catch(onPlayError);
      else a.pause();
    },
    [audio, onPlayError]
  );
  const togglePlay = useCallback(() => setPlaying(!playingRef.current), [setPlaying]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!queueRef.current) return;
      // "Previous" a few seconds into a work restarts it, like most players.
      if (dir === -1 && elapsed > 3) {
        setElapsed(0);
        if (workAt(queueRef.current)?.audioUrl) audio().currentTime = 0;
        return;
      }
      setPlayingState(true);
      stepInternal(dir);
    },
    [elapsed, audio, stepInternal]
  );

  const seekPct = useCallback(
    (pct: number) => {
      const w = workAt(queueRef.current);
      if (!w) return;
      if (w.audioUrl) {
        const a = audio();
        const total = Number.isFinite(a.duration) ? a.duration : secs(w.durationLabel);
        a.currentTime = (pct / 100) * total;
        setElapsed(Math.floor(a.currentTime));
        return;
      }
      const total = secs(w.durationLabel);
      setElapsed(Math.max(0, Math.min(total - 1, (pct / 100) * total)));
    },
    [audio]
  );

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
    audioRef.current?.pause();
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
